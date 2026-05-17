import { autoBind } from "@content-editor/utils/object";
import { useEffect, useMemo, useRef } from "react";
import { AnyBlock, ContentEditor } from "../editor";
import { execCommand } from "../editor/command";
import { EditorEvent, EditorEventTarget } from "../editor/event";
import { EditorAction } from "../editor/history";
import { EditorProjection } from "../editor/projection";
import { EditorTarget } from "../editor/target";
import { HistoryShim } from "../utils/history";

export function useEditorProjection<
  TParent extends AnyBlock,
  TBlock extends AnyBlock,
>({
  editor: parent,
  projection,
}: {
  editor: ContentEditor<TParent>;
  projection: EditorProjection<TParent, TBlock>;
}): ContentEditor<TBlock> {
  const bus = useMemo(() => new EditorEventTarget<TBlock>(), []);
  const blocks = useMemo(
    () => projection.state.get(parent.blocks),
    [parent.blocks, projection],
  );

  const editor = useMemo<ContentEditor<TBlock>>(
    () =>
      autoBind({
        id: `{${parent.id}}`,
        parent,
        bus,

        get currentAction() {
          if (!parent.currentAction) return null;
          return projection.action(parent.blocks).view(parent.currentAction);
        },

        get hasUnsavedChanges() {
          return parent.hasUnsavedChanges;
        },

        blocks,
        revision: parent.revision,

        history: new HistoryShim(parent.history, projection.state.get),

        ref(id) {
          const parentId = projection.id(id);
          const parentRef = parent.ref(parentId);
          const childId = projection.childId();

          if (typeof childId === "undefined") {
            return parentRef;
          }

          return Object.assign(
            (element: HTMLElement | null) => {
              const children = parent.ref(parentId).children;
              if (element) children.set(childId, element);
              else children.delete(childId);
            },
            {
              get element() {
                return parent.ref(parentId).children.get(childId) ?? null;
              },

              get children() {
                return new Map();
              },
            },
          );
        },

        exec(cmd, id) {
          const target = EditorTarget.read(this, id);
          const block = blocks.find((b) => b.id === id);
          return execCommand(this, target, block)(cmd);
        },

        discard(data) {
          parent.discard(data);
        },

        peek(id, flushData) {
          bus.dispatchTypedEvent(
            "flush",
            new EditorEvent("flush", this, { data: flushData }),
          );

          parent.peek(projection.id(id), flushData);

          return (
            projection.state
              .get(parent.history.getState())
              .find((b) => b.id === id) ?? null
          );
        },

        push({ data, ...action }) {
          const [cmd] = EditorAction.flat([action]);
          const idBefore = cmd.type === "split" ? cmd.left.id : cmd.block.id;
          const idAfter = cmd.type === "split" ? cmd.right.id : cmd.block.id;

          const parentAction = projection
            .action(parent.history.getState())
            .review({
              ...action,
              targetBefore:
                action.targetBefore ??
                this.currentAction?.targetBefore ??
                EditorTarget.start({ id: idBefore }),
              targetAfter:
                action.targetAfter ??
                this.currentAction?.targetAfter ??
                EditorTarget.start({ id: idAfter }),
            });

          if (!parentAction) return;

          bus.dispatchTypedEvent(
            "flush",
            new EditorEvent("flush", this, { data }),
          );

          const event = new EditorEvent("push", this, { action, data });
          bus.dispatchTypedEvent("push", event);

          if (event.defaultPrevented) return;

          parent.push({ ...parentAction, data });
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
    [blocks, bus, parent, projection],
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
