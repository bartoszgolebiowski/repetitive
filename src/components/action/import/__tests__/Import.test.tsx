import { render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, vi, it, expect } from "vitest";
import Import from "../Import";
import { z } from "zod";
import userEvent from "@testing-library/user-event";

const schema = z.object({
  name: z.string().nonempty(),
  description: z.string().nonempty(),
});

const onImport = vi.fn();

describe("Import", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should render Import button", () => {
    render(
      <Import
        onImport={onImport}
        schema={schema}
        status="idle"
      />
    );
    screen.getByRole("button", { name: /import/i });
  });

  it("should render Import modal with dropzone, close, submit button, submit button should be disabled when no csv selected", async () => {
    render(
      <Import
        onImport={onImport}
        schema={schema}
        status="idle"
      />
    );
    const importButton = screen.getByRole("button", { name: /import/i });
    await userEvent.click(importButton);
    screen.getByRole("button", { name: /close/i });
    screen.getByRole("button", { name: /submit/i });
    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  it("should close modal after clicking close button", async () => {
    render(
      <Import
        onImport={onImport}
        schema={schema}
        status="idle"
      />
    );
    const importButton = screen.getByRole("button", { name: /import/i });
    await userEvent.click(importButton);
    const closeButton = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeButton);
    expect(
      screen.queryByRole("button", { name: /close/i })
    ).not.toBeInTheDocument();
  });

  it("should display table with all data from csv, csv contains all correct rows", async () => {
    const { getByTestId } = render(
      <Import
        onImport={onImport}
        schema={schema}
        status="idle"
      />
    );
    const importButton = screen.getByRole("button", { name: /import/i });
    await userEvent.click(importButton);
    const fileUploadInput = getByTestId("upload-input");
    const file = new File(
      ["name,description\nname1,description1"],
      "test.csv",
      {
        type: "text/csv",
      }
    );
    await userEvent.upload(fileUploadInput, file);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled()
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryAllByRole("row")).toHaveLength(2);
  });

  it("should display error message when csv file is not valid", async () => {
    render(
      <Import
        onImport={onImport}
        schema={schema}
        status="idle"
      />
    );
    const importButton = screen.getByRole("button", { name: /import/i });
    await userEvent.click(importButton);
    const fileUploadInput = screen.getByTestId("upload-input");
    const file = new File(
      ["name,description\n abcd,edgh \n,, \nijk, \n,lmno"],
      "test.csv",
      {
        type: "text/csv",
      }
    );
    await userEvent.upload(fileUploadInput, file);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled()
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    const allRows = screen.queryAllByRole("row");
    expect(allRows).toHaveLength(5);

    const firstErrorRow = allRows.slice(1)[1];
    const secondErrorRow = allRows.slice(1)[2];
    const thirdErrorRow = allRows.slice(1)[3];

    if (!firstErrorRow || !secondErrorRow || !thirdErrorRow) {
      throw new Error("Rows not found");
    }

    expect(screen.getByTestId("row-1-invalid")).toBeInTheDocument();
    expect(within(firstErrorRow).getByTestId("cell-name-invalid"));
    expect(within(firstErrorRow).getByTestId("cell-description-invalid"));

    expect(screen.getByTestId("row-2-invalid")).toBeInTheDocument();
    expect(within(secondErrorRow).getByTestId("cell-description-invalid"));

    expect(screen.getByTestId("row-3-invalid")).toBeInTheDocument();
    expect(
      within(thirdErrorRow).getByTestId("cell-name-invalid")
    ).toBeInTheDocument();
  });
});
