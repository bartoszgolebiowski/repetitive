import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CommentCellOriginal from "../CommentCell";
import React from "react";
import userEvent from "@testing-library/user-event";

const CommentCell = (
  props: React.ComponentProps<typeof CommentCellOriginal>
) => (
  <table>
    <tbody>
      <tr>
        <CommentCellOriginal {...props} />
      </tr>
    </tbody>
  </table>
);

describe("CommentCell", () => {
  it("should render icon to open modal for adding comments", () => {
    const onSubmit = vi.fn();
    render(<CommentCell comments={[]} status="idle" onSubmit={onSubmit} />);
    expect(
      screen.getByRole("button", { name: "Add comment" })
    ).toBeInTheDocument();
  });

  it("should open modal", async () => {
    const onSubmit = vi.fn();
    render(<CommentCell comments={[]} status="idle" onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Add comment" }));

    expect(screen.getByRole("textbox", { name: /comment/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled();
  });

  it("should disable add comment when status loading", () => {
    const onSubmit = vi.fn();
    render(<CommentCell comments={[]} status="loading" onSubmit={onSubmit} />);
    expect(screen.getByRole("button", { name: "Add comment" })).toBeDisabled();
  });

  it("should disable submit and cancel buttons when status loading", async () => {
    const onSubmit = vi.fn();
    const { rerender } = render(
      <CommentCell comments={[]} status="idle" onSubmit={onSubmit} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Add comment" }));
    rerender(
      <CommentCell comments={[]} status="loading" onSubmit={onSubmit} />
    );
    expect(screen.getByRole("textbox", { name: /comment/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
  });

  it("should open modal and close modal", async () => {
    const onSubmit = vi.fn();
    render(<CommentCell comments={[]} status="idle" onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Add comment" }));

    expect(screen.getByRole("textbox", { name: /comment/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled();

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(
      screen.queryByRole("textbox", { name: /comment/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /cancel/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /submit/i })
    ).not.toBeInTheDocument();
  });

  it("should render disable comments and enable new comment textfield cancel and submit button", async () => {
    const onSubmit = vi.fn();
    const createdBy1 = "anna.smith@gmail.com";
    const createdBy2 = "john.snow@gmail.com";
    const comments = [
      {
        comment: "comment",
        createdBy: createdBy1,
        createdAt: new Date("2021-10-10"),
        id: "id",
      },
      {
        comment: "comment2",
        createdBy: createdBy2,
        createdAt: new Date("2021-10-12"),
        id: "id2",
      },
    ];
    render(
      <CommentCell comments={comments} status="idle" onSubmit={onSubmit} />
    );

    await userEvent.click(screen.getByRole("button", { name: "Add comment" }));
    expect(
      screen.getByRole("textbox", { name: RegExp(createdBy1) })
    ).toBeDisabled();
    expect(
      screen.getByRole("textbox", { name: RegExp(createdBy2) })
    ).toBeDisabled();

    expect(screen.getByRole("textbox", { name: /comment/i })).toBeEnabled();
  });

  it('should invoke onSubmit after providing comment and clicking "submit"', async () => {
    const onSubmit = vi.fn();
    render(<CommentCell comments={[]} status="idle" onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Add comment" }));
    await userEvent.type(
      screen.getByRole("textbox", { name: /comment/i }),
      "test"
    );
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalledWith("test");
  });
});
