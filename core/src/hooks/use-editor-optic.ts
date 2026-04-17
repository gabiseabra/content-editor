import { autoBind } from "@content-editor/utils/object";
import { useEffect, useMemo, useRef } from "react";
import { AnyBlock, ContentEditor } from "../editor";
import { execCommand } from "../editor/command";
import { EditorEvent, EditorEventTarget } from "../editor/event";
import { EditorAction, EditorHistoryEntry } from "../editor/history";
import { EditorTarget } from "../editor/target";

/**
 * Shared base for `useEditorTraversal` and `useEditorPrism`.
 *
 * Produces a `ContentEditor<TBlock>` that is a scoped view into a parent
 * editor.  The caller supplies `project` (read path) and `lift` (write path);
 * `parentId` distinguishes the two structural relationships:
 *
 * - **Traversal** (`parentId` provided): child blocks live *inside* a specific
 *   parent block.  Child ids are tracked via `EditorTarget.childId`.
 * - **Prism** (`parentId` absent): each child block *is* a parent block — a
 *   union-type variant.  Child id equals the parent block id.
 */
export function useEditorOptic<
  TParent extends AnyBlock,
  TBlock extends AnyBlock,
>({
  editor: parent,
  project,
  lift,
  parentId,
}: {
  editor: ContentEditor<TParent>;

  /** Maps all parent blocks to the focused child blocks (used for `blocks`, `history.getState`, and `peek`). */
  project: (blocks: TParent[]) => TBlock[];

  /**
   * Lifts a child-level action to a parent-level action.
   * Returns `null` if the lift cannot proceed (e.g. the parent block
   * disappeared mid-mutation).
   */
  lift: (
    action: EditorAction<TBlock> & {
      targetBefore?: EditorTarget<TBlock>;
      targetAfter?: EditorTarget<TBlock>;
    },
  ) =>
    | (EditorAction<TParent> & {
        targetBefore?: EditorTarget<TParent>;
        targetAfter?: EditorTarget<TParent>;
      })
    | null;

  /**
   * When provided (traversal): child blocks are nested inside this parent
   * block.  `peek` and `ref` operate on the parent block; `EditorTarget.childId`
   * identifies the focused child.
   *
   * When absent (prism): child id equals parent id.  `peek` and `ref` look
   * up the parent block by matching id.
   */
  parentId?: TParent["id"];
}): ContentEditor<TBlock> {
  const bus = useMemo(() => new EditorEventTarget<TBlock>(), []);
  const blocks = useMemo(() => project(parent.blocks), [parent]);

  const getLatest = (
    parentAction: EditorHistoryEntry<TParent>,
  ): EditorHistoryEntry<TBlock> | null => {
    const { targetBefore, targetAfter } = parentAction;
    const relevant =
      parent.history.direction === 1 ? targetAfter : targetBefore;

    // Traversal: child is identified by childId (optional — may be absent).
    // Prism: child id === parent id, so relevant.id is always defined.
    const childBlockId =
      parentId !== undefined ? relevant.childId : relevant.id;
    if (parentId !== undefined && childBlockId === undefined) return null;

    const block = blocks.find((b) => b.id === childBlockId);
    if (!block) return null;

    const narrowTarget = (t: EditorTarget<TParent>): EditorTarget<TBlock> => {
      const nid = parentId !== undefined ? t.childId : t.id;
      const matched =
        nid !== undefined ? blocks.find((b) => b.id === nid) : undefined;
      return { ...t, id: (matched ?? block).id, childId: undefined };
    };

    return {
      ...EditorAction.map(parentAction, (b) => project([b])[0] ?? block),
      targetBefore: narrowTarget(targetBefore),
      targetAfter: narrowTarget(targetAfter),
    };
  };

  const editor = useMemo<ContentEditor<TBlock>>(
    () =>
      autoBind({
        id: `{${parent.id}${parentId !== undefined ? `,${String(parentId)}` : ""}}`,
        parent,

        bus,

        get latest() {
          return parent.latest && getLatest(parent.latest);
        },

        get hasUnsavedChanges() {
          return parent.hasUnsavedChanges;
        },

        blocks,
        revision: parent.revision,

        history: {
          get position() {
            return parent.history.position;
          },

          get direction() {
            return parent.history.direction;
          },

          getState() {
            return project(parent.history.getState());
          },

          undo(dryRun?: boolean) {
            return parent.history.undo(dryRun);
          },

          redo(dryRun?: boolean) {
            return parent.history.redo(dryRun);
          },
        },

        ref(id) {
          if (parentId !== undefined) {
            const parentRef = parent.ref(parentId);
            return Object.assign(
              (element: HTMLElement | null) => {
                if (element) parentRef.children.set(id, element);
                else parentRef.children.delete(id);
              },
              {
                get element() {
                  return parentRef.children.get(id) ?? null;
                },
                get children() {
                  return new Map();
                },
              },
            );
          }

          const parentBlock = parent.blocks.find((b) => b.id === id);
          if (!parentBlock) {
            return Object.assign(() => {}, {
              get element() {
                return null;
              },
              get children() {
                return new Map();
              },
            });
          }
          return parent.ref(parentBlock.id);
        },

        exec(cmd, id) {
          const target = EditorTarget.read(this);
          const block = id ? this.blocks.find((b) => b.id === id) : undefined;
          if (!target || (id && !block)) return;
          return execCommand(this, target, block)(cmd);
        },

        discard(data) {
          parent.discard(data);
        },

        peek(id, flushData) {
          bus.dispatchTypedEvent(
            "flush",
            new EditorEvent("flush", this, { data: undefined }),
          );

          if (parentId !== undefined) {
            const parentBlock = parent.peek(parentId, flushData);
            if (!parentBlock) return null;
            return project([parentBlock]).find((b) => b.id === id) ?? null;
          }

          const matchingParent = parent.blocks.find((b) => b.id === id);
          if (!matchingParent) return null;
          const parentBlock = parent.peek(matchingParent.id, flushData);
          if (!parentBlock) return null;
          return project([parentBlock]).find((b) => b.id === id) ?? null;
        },

        push({ data, ...action }) {
          bus.dispatchTypedEvent(
            "flush",
            new EditorEvent("flush", this, { data }),
          );

          const event = new EditorEvent("push", this, { action, data });
          bus.dispatchTypedEvent("push", event);

          if (event.defaultPrevented) return;

          const parentAction = lift(action);
          if (!parentAction) return;

          parent.push({ data, ...parentAction });
        },

        commit(data) {
          const event = new EditorEvent("commit", this, {
            blocks: this.blocks,
            revision: this.revision,
            data,
          });
          bus.dispatchTypedEvent("commit", event);

          if (event.defaultPrevented) return;

          parent.commit(data);
        },
      }),
    [parentId, parent, bus],
  );

  const isReadyRef = useRef(false);
  useEffect(() => {
    const event = !isReadyRef.current
      ? new EditorEvent("ready", editor, {})
      : new EditorEvent("postcommit", editor, {});

    editor.bus.dispatchTypedEvent(event.eventType, event);
    isReadyRef.current = true;
  }, [editor]);

  return editor;
}
