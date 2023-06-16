import { z } from "zod";

const SPLITTER = ",";
const END_OF_LINE = "\n";
const JOINER = ", ";
const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;

export const numberCSVRequired = () => numericString(z.number())
export const numberCSVOptional = () => numericString(z.number().nullable());
export const stringCSVRequired = () => z.string().nonempty();
export const stringCSVOptional = () => z.string().default("");
export const validUserCSVRequired = (validUsers: string[]) => z.string().refine((u) => validUsers.includes(u))
export const validEnumRequired = (validUsers: string[]) => z.string().refine((u) => validUsers.includes(u))
export const dateCSVRequired = () => z.string().regex(dateRegex)

export const attachDueDateStartDateRefine = (schema: z.ZodObject<{
    dueDate: z.ZodString;
    startDate: z.ZodString;
}>) =>
    schema.refine(
        (data) => isDueDateEqualOrAfterStartDate(data.dueDate, data.startDate), {
        message: "Due date must be after start date",
        path: ["dueDate"],
    })

const numericString = (schema: z.ZodTypeAny) =>
    z.preprocess((a) => {
        if (a === "") return null;
        if (typeof a === "string") {
            return parseInt(a, 10);
        }
    }, schema);

const isDueDateEqualOrAfterStartDate = (
    dueDate?: string,
    startDate?: string
) => {
    if (!dueDate) return false;
    if (!startDate) return true;
    const yearDueDate = parseInt(dueDate.substring(0, 4));
    const monthDueDate = parseInt(dueDate.substring(5, 7));
    const dayDueDate = parseInt(dueDate.substring(8, 10));

    const yearStartDate = parseInt(startDate.substring(0, 4));
    const monthStartDate = parseInt(startDate.substring(5, 7));
    const dayStartDate = parseInt(startDate.substring(8, 10));

    if (yearDueDate > yearStartDate) {
        return true;
    }

    if (yearDueDate === yearStartDate) {
        if (monthDueDate > monthStartDate) {
            return true;
        }

        if (monthDueDate === monthStartDate) {
            if (dayDueDate >= dayStartDate) {
                return true;
            }
        }
    }

    return false;
};

export const zodKeys = <T extends z.ZodTypeAny>(schema: T): string[] => {
    if (schema === null || schema === undefined) return [];
    if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional) return zodKeys(schema.unwrap());
    if (schema instanceof z.ZodArray) return zodKeys(schema.element);
    if (schema instanceof z.ZodObject) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const entries = Object.entries(schema.shape);
        return entries.flatMap(([key, value]) => {
            const nested = value instanceof z.ZodType ? zodKeys(value).map(subKey => `${key}.${subKey}`) : [];
            return nested.length ? nested : key;
        });
    }
    if (schema instanceof z.ZodEffects) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const innerType = schema.innerType();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!innerType.shape) return []
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        const entries = Object.entries(innerType.shape);
        return entries.flatMap(([key, value]) => {
            const nested = value instanceof z.ZodType ? zodKeys(value).map(subKey => `${key}.${subKey}`) : [];
            return nested.length ? nested : key;
        });
    }
    return [];
};

const schemaFactory = <T extends z.ZodTypeAny>(schema: T) => (data: unknown): z.infer<T> => {
    const result = schema.safeParse(data)
    if (result.success) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result.data as z.infer<T>;
    }
    return null
};

const getCSVHeaderErrors = (csvContent: string, schema: z.ZodTypeAny) => {
    const expectedHeaders = zodKeys(schema).map(header => header.trim());
    const headerLine = csvContent.split(END_OF_LINE)[0];
    if (!headerLine) return {
        header: `Header is empty.  
Expected headers: ${expectedHeaders.join(JOINER)}`
    } as Record<string, string>
    const csvHeaders = headerLine.split(SPLITTER).map((header) => header.trim());
    const missingHeaders = expectedHeaders.map(header => header.trim()).filter((header) => !csvHeaders.includes(header.trim()));
    if (!missingHeaders.length) return {} as Record<string, string>
    return {
        header: `Corrupted headers. Missing headers: ${missingHeaders.join(JOINER)}. Expected headers: ${expectedHeaders.join(JOINER)}`
    } as Record<string, string>
}

const getCSVBodyErrors = (csvContent: string, schema: z.ZodTypeAny) => {
    const rows = getRowsFromCSVRaw(csvContent, schema);
    const errors = rows.reduce((errors, row, index) => {
        const parsed = schema.safeParse(row);
        if (!parsed.success) {
            const rowErrors = parsed.error.flatten().fieldErrors;
            const rowErrorsString = Object.entries(rowErrors).map(([key]) => key).join(JOINER);
            errors[index] = rowErrorsString;
        }
        return errors;
    }, {} as Record<string, string>);
    return errors as Record<string, string>
}

const getCSVErrors = <T extends z.ZodTypeAny>(csvContent: string, schema: T) => {
    return {
        ...getCSVBodyErrors(csvContent, schema),
        ...getCSVHeaderErrors(csvContent, schema)
    }
}

const getHeadersFromCSV = (csvContent: string) => {
    if (!csvContent) return [];
    const headerLine = csvContent.split(END_OF_LINE)[0];
    if (!headerLine) return [];
    return headerLine.split(SPLITTER).map((header) => header.trim());
}

const getRowsFromCSVRaw = <T extends z.ZodType>(csvContent: string, schema: T) => {
    const headers = zodKeys(schema).map(header => header.trim());
    const lines = csvContent.split(END_OF_LINE);
    const rawRows = lines.slice(1).map((line) => {
        const cells = line.split(SPLITTER);
        return headers.reduce((row, header, index) => {
            let cell = cells[index];
            if (cell) {
                cell = cell.trim();
            }
            row[header] = cell
            return row;
        }, {} as Record<string, string | undefined>)
    });
    return rawRows;
};

const getRowsFromCSV = <T extends z.ZodType>(csvContent: string, schema: T) => {
    const parse = schemaFactory(schema);
    return getRowsFromCSVRaw(csvContent, schema).map(parse).filter(Boolean);
};

const getCSVContent = (csv: File) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsText(csv);
    });
};

export const getRowsAndHeaderFromCSVContent = <T extends z.ZodType>(csvContent: string, schema: T) => ({
    header: getHeadersFromCSV(csvContent),
    allRows: getRowsFromCSVRaw(csvContent, schema),
    validRows: getRowsFromCSV(csvContent, schema),
    errors: getCSVErrors(csvContent, schema)
})

export const getRowsAndHeaderFromCSVFile = async <T extends z.ZodType>(csv: File, schema: T) => {
    const csvContent = await getCSVContent(csv);
    return getRowsAndHeaderFromCSVContent(csvContent, schema)
}

const isValidRow = (validRows: unknown[], row: unknown) => {
    return validRows.some(
        (validRow) =>
            JSON.stringify(validRow) ===
            JSON.stringify(row)
    )
}

const isValidCell = (
    errors: Record<string, string>,
    field: string,
    currentRow: number
) => {
    return !Object.entries(errors).some(
        ([rowNumber, error]) =>
            Number(rowNumber) === currentRow && error.includes(field)
    );
}
export const sxRow = (validRows: unknown[], row: unknown) => {
    return {
        backgroundColor: isValidRow(validRows, row) ? "green" : "initial",
    };
};

export const rowId = (
    validRows: unknown[],
    row: unknown,
    currentRow: number
) => {
    return `row-${currentRow}-${isValidRow(
        validRows,
        row
    ) ? "valid" : "invalid"}`
}

export const sxCell = (
    errors: Record<string, string>,
    field: string,
    currentRow: number
) => {
    return {
        backgroundColor: isValidCell(errors, field, currentRow)
            ? "initial"
            : "green",
    };
};

export const cellId = (
    errors: Record<string, string>,
    field: string,
    currentRow: number
) => {
    return `cell-${field}-${isValidCell(
        errors,
        field,
        currentRow
    ) ? "valid" : "invalid"}`
}