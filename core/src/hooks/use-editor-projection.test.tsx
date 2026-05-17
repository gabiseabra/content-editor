/**
 * @jest-environment jsdom
 */
import { SelectionRange } from "@content-editor/utils/selection-range";
import { render, screen } from "@testing-library/react";
import { act, RefObject, useImperativeHandle } from "react";
import { AnyBlock, ContentEditor } from "../editor";
import { EditorProjection } from "../editor/projection";
import { useContentEditor } from "./use-content-editor";
import { useEditorProjection } from "./use-editor-projection";

type TextBlock = { id: string; text: string };
type CardBlock = { id: string; title: TextBlock; body: TextBlock };
type ParagraphBlock = { id: string; kind: "paragraph"; text: string };
type DividerBlock = { id: string; kind: "divider" };
type DocBlock = ParagraphBlock | DividerBlock;

function Probe<TParent extends AnyBlock, TBlock extends AnyBlock>({
  initialValue,
  parentRef,
  projectedRef,
  projection,
}: {
  initialValue: TParent[];
  parentRef: RefObject<ContentEditor<TParent> | null>;
  projectedRef: RefObject<ContentEditor<TBlock> | null>;
  projection: EditorProjection<TParent, TBlock>;
}) {
  const parent = useContentEditor<TParent>({ id: "test", initialValue });
  const projected = useEditorProjection({ editor: parent, projection });

  useImperativeHandle(parentRef, () => parent, [parent]);
  useImperativeHandle(projectedRef, () => projected, [projected]);

  return (
    <>
      {projected.blocks.map((block) => (
        <div
          contentEditable="plaintext-only"
          data-testid={String(block.id)}
          key={String(block.id)}
          ref={projected.ref(block.id)}
          suppressContentEditableWarning
        >
          {"text" in block ? String(block.text) : ""}
        </div>
      ))}
    </>
  );
}

describe("useEditorProjection", () => {
  describe("fromLens", () => {
    it("blocks contains only the focused nested block", () => {
      const parentRef: RefObject<ContentEditor<CardBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<TextBlock> | null> = {
        current: null,
      };

      render(
        <Probe<CardBlock, TextBlock>
          initialValue={[
            {
              id: "card-1",
              title: { id: "card-1-title", text: "Title one" },
              body: { id: "card-1-body", text: "Body one" },
            },
            {
              id: "card-2",
              title: { id: "card-2-title", text: "Title two" },
              body: { id: "card-2-body", text: "Body two" },
            },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromLens<CardBlock, TextBlock>(
            "card-1",
            "card-1-title",
            {
              get: (card) => card.title,
              set: (card, title) => ({ ...card, title }),
            },
          )}
        />,
      );

      expect(projectedRef.current!.blocks).toEqual([
        { id: "card-1-title", text: "Title one" },
      ]);
    });

    it("registers the focused block ref", () => {
      const parentRef: RefObject<ContentEditor<CardBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<TextBlock> | null> = {
        current: null,
      };
      render(
        <Probe<CardBlock, TextBlock>
          initialValue={[
            {
              id: "card-1",
              title: { id: "card-1-title", text: "Title one" },
              body: { id: "card-1-body", text: "Body one" },
            },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromLens<CardBlock, TextBlock>(
            "card-1",
            "card-1-title",
            {
              get: (card) => card.title,
              set: (card, title) => ({ ...card, title }),
            },
          )}
        />,
      );
      const projected = projectedRef.current!;

      expect(projected.ref("card-1-title").element).toBe(
        screen.getByTestId("card-1-title"),
      );
    });

    it("push leaves the focused update pending until commit", async () => {
      const parentRef: RefObject<ContentEditor<CardBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<TextBlock> | null> = {
        current: null,
      };

      render(
        <Probe<CardBlock, TextBlock>
          initialValue={[
            {
              id: "card-1",
              title: { id: "card-1-title", text: "Title one" },
              body: { id: "card-1-body", text: "Body one" },
            },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromLens<CardBlock, TextBlock>(
            "card-1",
            "card-1-title",
            {
              get: (card) => card.title,
              set: (card, title) => ({ ...card, title }),
            },
          )}
        />,
      );

      const block = await act(() => {
        projectedRef.current!.push({
          type: "update",
          block: { id: "card-1-title", text: "Pending title" },
        });
        return projectedRef.current!.peek("card-1-title");
      });

      expect(parentRef.current!.blocks).toEqual([
        {
          id: "card-1",
          title: { id: "card-1-title", text: "Title one" },
          body: { id: "card-1-body", text: "Body one" },
        },
      ]);

      expect(block?.text).toBe("Pending title");
      expect(projectedRef.current!.hasUnsavedChanges).toBe(true);
    });

    it("peek returns pending focused changes and emits flush", async () => {
      const log = jest.fn();
      const parentRef: RefObject<ContentEditor<CardBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<TextBlock> | null> = {
        current: null,
      };

      render(
        <Probe<CardBlock, TextBlock>
          initialValue={[
            {
              id: "card-1",
              title: { id: "card-1-title", text: "Title one" },
              body: { id: "card-1-body", text: "Body one" },
            },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromLens<CardBlock, TextBlock>(
            "card-1",
            "card-1-title",
            {
              get: (card) => card.title,
              set: (card, title) => ({ ...card, title }),
            },
          )}
        />,
      );
      projectedRef.current!.bus.addEventListener("flush", log);

      act(() => {
        projectedRef.current!.push({
          type: "update",
          block: { id: "card-1-title", text: "Pending title" },
        });
      });
      log.mockClear();

      const block = await act(() =>
        projectedRef.current!.peek("card-1-title", "peek-data"),
      );

      expect(block?.text).toBe("Pending title");
      expect(log).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "flush",
          detail: expect.objectContaining({ data: "peek-data" }),
        }),
      );
    });

    it("commit writes the focused update into the parent block", () => {
      const parentRef: RefObject<ContentEditor<CardBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<TextBlock> | null> = {
        current: null,
      };

      render(
        <Probe<CardBlock, TextBlock>
          initialValue={[
            {
              id: "card-1",
              title: { id: "card-1-title", text: "Title one" },
              body: { id: "card-1-body", text: "Body one" },
            },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromLens<CardBlock, TextBlock>(
            "card-1",
            "card-1-title",
            {
              get: (card) => card.title,
              set: (card, title) => ({ ...card, title }),
            },
          )}
        />,
      );

      act(() => {
        projectedRef.current!.push({
          type: "update",
          block: { id: "card-1-title", text: "Committed title" },
        });
        projectedRef.current!.commit();
      });

      expect(parentRef.current!.blocks).toEqual([
        {
          id: "card-1",
          title: { id: "card-1-title", text: "Committed title" },
          body: { id: "card-1-body", text: "Body one" },
        },
      ]);
      expect(screen.getByTestId("card-1-title")).toHaveTextContent(
        "Committed title",
      );
    });

    it("commit maps a focused split to the left focused block", () => {
      const parentRef: RefObject<ContentEditor<CardBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<TextBlock> | null> = {
        current: null,
      };

      render(
        <Probe<CardBlock, TextBlock>
          initialValue={[
            {
              id: "card-1",
              title: { id: "card-1-title", text: "Title one" },
              body: { id: "card-1-body", text: "Body one" },
            },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromLens<CardBlock, TextBlock>(
            "card-1",
            "card-1-title",
            {
              get: (card) => card.title,
              set: (card, title) => ({ ...card, title }),
            },
          )}
        />,
      );

      act(() => {
        projectedRef.current!.push({
          type: "split",
          left: { id: "card-1-title", text: "Title" },
          right: { id: "card-1-subtitle", text: "one" },
        });
        projectedRef.current!.commit();
      });

      expect(parentRef.current!.blocks).toEqual([
        {
          id: "card-1",
          title: { id: "card-1-title", text: "Title" },
          body: { id: "card-1-body", text: "Body one" },
        },
      ]);
      expect(projectedRef.current!.blocks).toEqual([
        { id: "card-1-title", text: "Title" },
      ]);
    });

    it("commit keeps the parent block when the focused block is removed", () => {
      const parentRef: RefObject<ContentEditor<CardBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<TextBlock> | null> = {
        current: null,
      };

      render(
        <Probe<CardBlock, TextBlock>
          initialValue={[
            {
              id: "card-1",
              title: { id: "card-1-title", text: "Title one" },
              body: { id: "card-1-body", text: "Body one" },
            },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromLens<CardBlock, TextBlock>(
            "card-1",
            "card-1-title",
            {
              get: (card) => card.title,
              set: (card, title) => ({ ...card, title }),
            },
          )}
        />,
      );

      act(() => {
        projectedRef.current!.push({
          type: "remove",
          block: { id: "card-1-title", text: "Title one" },
        });
        projectedRef.current!.commit();
      });

      expect(parentRef.current!.blocks).toEqual([
        {
          id: "card-1",
          title: { id: "card-1-title", text: "Title one" },
          body: { id: "card-1-body", text: "Body one" },
        },
      ]);
      expect(projectedRef.current!.blocks).toEqual([
        { id: "card-1-title", text: "Title one" },
      ]);
    });

    it("discard clears a pending focused update", async () => {
      const parentRef: RefObject<ContentEditor<CardBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<TextBlock> | null> = {
        current: null,
      };

      render(
        <Probe<CardBlock, TextBlock>
          initialValue={[
            {
              id: "card-1",
              title: { id: "card-1-title", text: "Title one" },
              body: { id: "card-1-body", text: "Body one" },
            },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromLens<CardBlock, TextBlock>(
            "card-1",
            "card-1-title",
            {
              get: (card) => card.title,
              set: (card, title) => ({ ...card, title }),
            },
          )}
        />,
      );

      const block = await act(() => {
        projectedRef.current!.push({
          type: "update",
          block: { id: "card-1-title", text: "Dirty title" },
        });
        projectedRef.current!.discard();
        return projectedRef.current!.peek("card-1-title");
      });

      expect(block?.text).toBe("Title one");
      expect(projectedRef.current!.hasUnsavedChanges).toBe(false);
    });

    it("undoes and redoes committed focused updates", async () => {
      const parentRef: RefObject<ContentEditor<CardBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<TextBlock> | null> = {
        current: null,
      };

      render(
        <Probe<CardBlock, TextBlock>
          initialValue={[
            {
              id: "card-1",
              title: { id: "card-1-title", text: "Title one" },
              body: { id: "card-1-body", text: "Body one" },
            },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromLens<CardBlock, TextBlock>(
            "card-1",
            "card-1-title",
            {
              get: (card) => card.title,
              set: (card, title) => ({ ...card, title }),
            },
          )}
        />,
      );

      const block = await act(() => {
        projectedRef.current!.push({
          type: "update",
          block: { id: "card-1-title", text: "One" },
        });
        projectedRef.current!.commit();
        projectedRef.current!.push({
          type: "update",
          block: { id: "card-1-title", text: "Two" },
        });
        projectedRef.current!.commit();
        projectedRef.current!.history.undo();
        projectedRef.current!.commit();
        return projectedRef.current!.peek("card-1-title");
      });

      expect(block?.text).toBe("One");

      const redoneBlock = await act(() => {
        projectedRef.current!.history.redo();
        projectedRef.current!.commit();
        return projectedRef.current!.peek("card-1-title");
      });

      expect(redoneBlock?.text).toBe("Two");
    });

    it("executes a command from the selected focused element", async () => {
      const parentRef: RefObject<ContentEditor<CardBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<TextBlock> | null> = {
        current: null,
      };

      render(
        <Probe<CardBlock, TextBlock>
          initialValue={[
            {
              id: "card-1",
              title: { id: "card-1-title", text: "Title one" },
              body: { id: "card-1-body", text: "Body one" },
            },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromLens<CardBlock, TextBlock>(
            "card-1",
            "card-1-title",
            {
              get: (card) => card.title,
              set: (card, title) => ({ ...card, title }),
            },
          )}
        />,
      );
      SelectionRange.apply(screen.getByTestId("card-1-title"), {
        start: 0,
        end: 0,
      });

      const block = await act(() => {
        projectedRef.current!.exec(({ block }) => ({
          ...block,
          text: "Exec changed",
        }));
        return projectedRef.current!.peek("card-1-title");
      });

      expect(block?.text).toBe("Exec changed");
    });

    it("fires flush and push for a focused update", () => {
      const log = jest.fn();
      const parentRef: RefObject<ContentEditor<CardBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<TextBlock> | null> = {
        current: null,
      };

      render(
        <Probe<CardBlock, TextBlock>
          initialValue={[
            {
              id: "card-1",
              title: { id: "card-1-title", text: "Title one" },
              body: { id: "card-1-body", text: "Body one" },
            },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromLens<CardBlock, TextBlock>(
            "card-1",
            "card-1-title",
            {
              get: (card) => card.title,
              set: (card, title) => ({ ...card, title }),
            },
          )}
        />,
      );
      projectedRef.current!.bus.addEventListener("flush", log);
      projectedRef.current!.bus.addEventListener("push", log);

      act(() => {
        projectedRef.current!.push({
          type: "update",
          block: { id: "card-1-title", text: "Changed" },
        });
      });

      expect(log).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "flush" }),
      );
      expect(log).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "push" }),
      );
    });

    it("fires commit and postcommit for a focused commit", () => {
      const log = jest.fn();
      const parentRef: RefObject<ContentEditor<CardBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<TextBlock> | null> = {
        current: null,
      };

      render(
        <Probe<CardBlock, TextBlock>
          initialValue={[
            {
              id: "card-1",
              title: { id: "card-1-title", text: "Title one" },
              body: { id: "card-1-body", text: "Body one" },
            },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromLens<CardBlock, TextBlock>(
            "card-1",
            "card-1-title",
            {
              get: (card) => card.title,
              set: (card, title) => ({ ...card, title }),
            },
          )}
        />,
      );
      projectedRef.current!.bus.addEventListener("commit", log);
      projectedRef.current!.bus.addEventListener("postcommit", log);

      act(() => {
        projectedRef.current!.push({
          type: "update",
          block: { id: "card-1-title", text: "Changed" },
        });
        projectedRef.current!.commit();
      });

      expect(log).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "commit" }),
      );
      expect(log).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "postcommit" }),
      );
    });

    it("does not apply a focused update when projected push is prevented", async () => {
      const parentRef: RefObject<ContentEditor<CardBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<TextBlock> | null> = {
        current: null,
      };

      render(
        <Probe<CardBlock, TextBlock>
          initialValue={[
            {
              id: "card-1",
              title: { id: "card-1-title", text: "Title one" },
              body: { id: "card-1-body", text: "Body one" },
            },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromLens<CardBlock, TextBlock>(
            "card-1",
            "card-1-title",
            {
              get: (card) => card.title,
              set: (card, title) => ({ ...card, title }),
            },
          )}
        />,
      );
      projectedRef.current!.bus.addEventListener("push", (event) => {
        event.preventDefault();
      });

      const block = await act(() => {
        projectedRef.current!.push({
          type: "update",
          block: { id: "card-1-title", text: "Blocked" },
        });
        projectedRef.current!.commit();
        return projectedRef.current!.peek("card-1-title");
      });

      expect(block?.text).toBe("Title one");
      expect(parentRef.current!.blocks).toEqual([
        {
          id: "card-1",
          title: { id: "card-1-title", text: "Title one" },
          body: { id: "card-1-body", text: "Body one" },
        },
      ]);
    });

    it("does not commit pending focused state when projected commit is prevented", async () => {
      const parentRef: RefObject<ContentEditor<CardBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<TextBlock> | null> = {
        current: null,
      };

      render(
        <Probe<CardBlock, TextBlock>
          initialValue={[
            {
              id: "card-1",
              title: { id: "card-1-title", text: "Title one" },
              body: { id: "card-1-body", text: "Body one" },
            },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromLens<CardBlock, TextBlock>(
            "card-1",
            "card-1-title",
            {
              get: (card) => card.title,
              set: (card, title) => ({ ...card, title }),
            },
          )}
        />,
      );
      projectedRef.current!.bus.addEventListener("commit", (event) => {
        event.preventDefault();
      });

      const block = await act(() => {
        projectedRef.current!.push({
          type: "update",
          block: { id: "card-1-title", text: "Pending blocked commit" },
        });
        projectedRef.current!.commit();
        return projectedRef.current!.peek("card-1-title");
      });

      expect(block?.text).toBe("Pending blocked commit");
      expect(parentRef.current!.blocks).toEqual([
        {
          id: "card-1",
          title: { id: "card-1-title", text: "Title one" },
          body: { id: "card-1-body", text: "Body one" },
        },
      ]);
    });
  });

  describe("fromGuard", () => {
    it("blocks contains only guarded top-level blocks", () => {
      const parentRef: RefObject<ContentEditor<DocBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<ParagraphBlock> | null> = {
        current: null,
      };

      render(
        <Probe<DocBlock, ParagraphBlock>
          initialValue={[
            { id: "p1", kind: "paragraph", text: "First" },
            { id: "d1", kind: "divider" },
            { id: "p2", kind: "paragraph", text: "Second" },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromGuard(
            (block: DocBlock): block is ParagraphBlock =>
              block.kind === "paragraph",
          )}
        />,
      );

      expect(projectedRef.current!.blocks).toEqual([
        { id: "p1", kind: "paragraph", text: "First" },
        { id: "p2", kind: "paragraph", text: "Second" },
      ]);
    });

    it("registers guarded block refs", () => {
      const parentRef: RefObject<ContentEditor<DocBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<ParagraphBlock> | null> = {
        current: null,
      };

      render(
        <Probe<DocBlock, ParagraphBlock>
          initialValue={[
            { id: "p1", kind: "paragraph", text: "First" },
            { id: "d1", kind: "divider" },
            { id: "p2", kind: "paragraph", text: "Second" },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromGuard(
            (block: DocBlock): block is ParagraphBlock =>
              block.kind === "paragraph",
          )}
        />,
      );

      expect(projectedRef.current!.ref("p1").element).toBe(
        screen.getByTestId("p1"),
      );
    });

    it("push leaves a guarded update pending until commit", async () => {
      const parentRef: RefObject<ContentEditor<DocBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<ParagraphBlock> | null> = {
        current: null,
      };

      render(
        <Probe<DocBlock, ParagraphBlock>
          initialValue={[
            { id: "p1", kind: "paragraph", text: "First" },
            { id: "d1", kind: "divider" },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromGuard(
            (block: DocBlock): block is ParagraphBlock =>
              block.kind === "paragraph",
          )}
        />,
      );

      const block = await act(() => {
        projectedRef.current!.push({
          type: "update",
          block: { id: "p1", kind: "paragraph", text: "Pending first" },
        });
        return projectedRef.current!.peek("p1");
      });

      expect(parentRef.current!.blocks).toEqual([
        { id: "p1", kind: "paragraph", text: "First" },
        { id: "d1", kind: "divider" },
      ]);

      expect(block?.text).toBe("Pending first");
      expect(projectedRef.current!.hasUnsavedChanges).toBe(true);
    });

    it("peek returns pending guarded changes and emits flush", async () => {
      const log = jest.fn();
      const parentRef: RefObject<ContentEditor<DocBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<ParagraphBlock> | null> = {
        current: null,
      };

      render(
        <Probe<DocBlock, ParagraphBlock>
          initialValue={[
            { id: "p1", kind: "paragraph", text: "First" },
            { id: "d1", kind: "divider" },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromGuard(
            (block: DocBlock): block is ParagraphBlock =>
              block.kind === "paragraph",
          )}
        />,
      );
      projectedRef.current!.bus.addEventListener("flush", log);

      act(() => {
        projectedRef.current!.push({
          type: "update",
          block: { id: "p1", kind: "paragraph", text: "Pending first" },
        });
      });
      log.mockClear();

      const block = await act(() => projectedRef.current!.peek("p1", "peek-data"));

      expect(block?.text).toBe("Pending first");
      expect(log).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "flush",
          detail: expect.objectContaining({ data: "peek-data" }),
        }),
      );
    });

    it("commit writes a guarded update into the parent document", () => {
      const parentRef: RefObject<ContentEditor<DocBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<ParagraphBlock> | null> = {
        current: null,
      };

      render(
        <Probe<DocBlock, ParagraphBlock>
          initialValue={[
            { id: "p1", kind: "paragraph", text: "First" },
            { id: "d1", kind: "divider" },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromGuard(
            (block: DocBlock): block is ParagraphBlock =>
              block.kind === "paragraph",
          )}
        />,
      );

      act(() => {
        projectedRef.current!.push({
          type: "update",
          block: { id: "p1", kind: "paragraph", text: "Committed first" },
        });
        projectedRef.current!.commit();
      });

      expect(parentRef.current!.blocks).toEqual([
        { id: "p1", kind: "paragraph", text: "Committed first" },
        { id: "d1", kind: "divider" },
      ]);
      expect(screen.getByTestId("p1")).toHaveTextContent("Committed first");
    });

    it("commit removes a guarded block from the parent document", () => {
      const parentRef: RefObject<ContentEditor<DocBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<ParagraphBlock> | null> = {
        current: null,
      };

      render(
        <Probe<DocBlock, ParagraphBlock>
          initialValue={[
            { id: "p1", kind: "paragraph", text: "First" },
            { id: "d1", kind: "divider" },
            { id: "p2", kind: "paragraph", text: "Second" },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromGuard(
            (block: DocBlock): block is ParagraphBlock =>
              block.kind === "paragraph",
          )}
        />,
      );

      act(() => {
        projectedRef.current!.push({
          type: "remove",
          block: { id: "p1", kind: "paragraph", text: "First" },
        });
        projectedRef.current!.commit();
      });

      expect(parentRef.current!.blocks).toEqual([
        { id: "d1", kind: "divider" },
        { id: "p2", kind: "paragraph", text: "Second" },
      ]);
      expect(projectedRef.current!.blocks).toEqual([
        { id: "p2", kind: "paragraph", text: "Second" },
      ]);
    });

    it("commit splits a guarded block in the parent document", () => {
      const parentRef: RefObject<ContentEditor<DocBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<ParagraphBlock> | null> = {
        current: null,
      };

      render(
        <Probe<DocBlock, ParagraphBlock>
          initialValue={[
            { id: "p1", kind: "paragraph", text: "First" },
            { id: "d1", kind: "divider" },
            { id: "p2", kind: "paragraph", text: "Second" },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromGuard(
            (block: DocBlock): block is ParagraphBlock =>
              block.kind === "paragraph",
          )}
        />,
      );

      act(() => {
        projectedRef.current!.push({
          type: "split",
          left: { id: "p1", kind: "paragraph", text: "Fi" },
          right: { id: "p3", kind: "paragraph", text: "rst" },
        });
        projectedRef.current!.commit();
      });

      expect(parentRef.current!.blocks).toEqual([
        { id: "p1", kind: "paragraph", text: "Fi" },
        { id: "p3", kind: "paragraph", text: "rst" },
        { id: "d1", kind: "divider" },
        { id: "p2", kind: "paragraph", text: "Second" },
      ]);
    });

    it("discard clears pending guarded changes", async () => {
      const parentRef: RefObject<ContentEditor<DocBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<ParagraphBlock> | null> = {
        current: null,
      };

      render(
        <Probe<DocBlock, ParagraphBlock>
          initialValue={[
            { id: "p1", kind: "paragraph", text: "First" },
            { id: "d1", kind: "divider" },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromGuard(
            (block: DocBlock): block is ParagraphBlock =>
              block.kind === "paragraph",
          )}
        />,
      );

      const block = await act(() => {
        projectedRef.current!.push({
          type: "update",
          block: { id: "p1", kind: "paragraph", text: "Dirty first" },
        });
        projectedRef.current!.discard();
        return projectedRef.current!.peek("p1");
      });

      expect(block?.text).toBe("First");
      expect(projectedRef.current!.hasUnsavedChanges).toBe(false);
    });

    it("undoes and redoes committed guarded updates", async () => {
      const parentRef: RefObject<ContentEditor<DocBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<ParagraphBlock> | null> = {
        current: null,
      };

      render(
        <Probe<DocBlock, ParagraphBlock>
          initialValue={[
            { id: "p1", kind: "paragraph", text: "First" },
            { id: "d1", kind: "divider" },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromGuard(
            (block: DocBlock): block is ParagraphBlock =>
              block.kind === "paragraph",
          )}
        />,
      );

      const block = await act(() => {
        projectedRef.current!.push({
          type: "update",
          block: { id: "p1", kind: "paragraph", text: "One" },
        });
        projectedRef.current!.commit();
        projectedRef.current!.push({
          type: "update",
          block: { id: "p1", kind: "paragraph", text: "Two" },
        });
        projectedRef.current!.commit();
        projectedRef.current!.history.undo();
        projectedRef.current!.commit();
        return projectedRef.current!.peek("p1");
      });

      expect(block?.text).toBe("One");

      const redoneBlock = await act(() => {
        projectedRef.current!.history.redo();
        projectedRef.current!.commit();
        return projectedRef.current!.peek("p1");
      });

      expect(redoneBlock?.text).toBe("Two");
    });

    it("executes a command from a selected guarded element", async () => {
      const parentRef: RefObject<ContentEditor<DocBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<ParagraphBlock> | null> = {
        current: null,
      };

      render(
        <Probe<DocBlock, ParagraphBlock>
          initialValue={[
            { id: "p1", kind: "paragraph", text: "First" },
            { id: "d1", kind: "divider" },
          ]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromGuard(
            (block: DocBlock): block is ParagraphBlock =>
              block.kind === "paragraph",
          )}
        />,
      );
      SelectionRange.apply(screen.getByTestId("p1"), { start: 0, end: 0 });

      const block = await act(() => {
        projectedRef.current!.exec(({ block }) => ({
          ...block,
          text: "Exec changed",
        }));
        return projectedRef.current!.peek("p1");
      });

      expect(block?.text).toBe("Exec changed");
    });

    it("fires flush and push for a guarded update", () => {
      const log = jest.fn();
      const parentRef: RefObject<ContentEditor<DocBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<ParagraphBlock> | null> = {
        current: null,
      };

      render(
        <Probe<DocBlock, ParagraphBlock>
          initialValue={[{ id: "p1", kind: "paragraph", text: "First" }]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromGuard(
            (block: DocBlock): block is ParagraphBlock =>
              block.kind === "paragraph",
          )}
        />,
      );
      projectedRef.current!.bus.addEventListener("flush", log);
      projectedRef.current!.bus.addEventListener("push", log);

      act(() => {
        projectedRef.current!.push({
          type: "update",
          block: { id: "p1", kind: "paragraph", text: "Changed" },
        });
      });

      expect(log).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "flush" }),
      );
      expect(log).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "push" }),
      );
    });

    it("fires commit and postcommit for a guarded commit", () => {
      const log = jest.fn();
      const parentRef: RefObject<ContentEditor<DocBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<ParagraphBlock> | null> = {
        current: null,
      };

      render(
        <Probe<DocBlock, ParagraphBlock>
          initialValue={[{ id: "p1", kind: "paragraph", text: "First" }]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromGuard(
            (block: DocBlock): block is ParagraphBlock =>
              block.kind === "paragraph",
          )}
        />,
      );
      projectedRef.current!.bus.addEventListener("commit", log);
      projectedRef.current!.bus.addEventListener("postcommit", log);

      act(() => {
        projectedRef.current!.push({
          type: "update",
          block: { id: "p1", kind: "paragraph", text: "Changed" },
        });
        projectedRef.current!.commit();
      });

      expect(log).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "commit" }),
      );
      expect(log).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: "postcommit" }),
      );
    });

    it("does not apply a guarded update when projected push is prevented", async () => {
      const parentRef: RefObject<ContentEditor<DocBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<ParagraphBlock> | null> = {
        current: null,
      };

      render(
        <Probe<DocBlock, ParagraphBlock>
          initialValue={[{ id: "p1", kind: "paragraph", text: "First" }]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromGuard(
            (block: DocBlock): block is ParagraphBlock =>
              block.kind === "paragraph",
          )}
        />,
      );
      projectedRef.current!.bus.addEventListener("push", (event) => {
        event.preventDefault();
      });

      const block = await act(() => {
        projectedRef.current!.push({
          type: "update",
          block: { id: "p1", kind: "paragraph", text: "Blocked" },
        });
        projectedRef.current!.commit();
        return projectedRef.current!.peek("p1");
      });

      expect(block?.text).toBe("First");
      expect(parentRef.current!.blocks).toEqual([
        { id: "p1", kind: "paragraph", text: "First" },
      ]);
    });

    it("does not commit pending guarded state when projected commit is prevented", async () => {
      const parentRef: RefObject<ContentEditor<DocBlock> | null> = {
        current: null,
      };
      const projectedRef: RefObject<ContentEditor<ParagraphBlock> | null> = {
        current: null,
      };

      render(
        <Probe<DocBlock, ParagraphBlock>
          initialValue={[{ id: "p1", kind: "paragraph", text: "First" }]}
          parentRef={parentRef}
          projectedRef={projectedRef}
          projection={EditorProjection.fromGuard(
            (block: DocBlock): block is ParagraphBlock =>
              block.kind === "paragraph",
          )}
        />,
      );
      projectedRef.current!.bus.addEventListener("commit", (event) => {
        event.preventDefault();
      });

      const block = await act(() => {
        projectedRef.current!.push({
          type: "update",
          block: {
            id: "p1",
            kind: "paragraph",
            text: "Pending blocked commit",
          },
        });
        projectedRef.current!.commit();
        return projectedRef.current!.peek("p1");
      });

      expect(block?.text).toBe("Pending blocked commit");
      expect(parentRef.current!.blocks).toEqual([
        { id: "p1", kind: "paragraph", text: "First" },
      ]);
    });
  });
});
