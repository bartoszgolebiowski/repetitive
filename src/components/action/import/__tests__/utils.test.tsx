import { describe, it, expect } from "vitest";
import {
  getRowsAndHeaderFromCSVContent,
  numberCSVRequired,
  numberCSVOptional,
  stringCSVRequired,
  stringCSVOptional,
  validUserCSVRequired,
  attachDueDateStartDateRefine,
  dateCSVRequired,
} from "../utils";
import { z } from "zod";

describe("utils", () => {
  const schema1 = z.object({
    name: stringCSVRequired(),
    age: numberCSVRequired(),
  });

  const schema2 = z.object({
    name: z.string(),
    age: numberCSVRequired(),
    description: stringCSVOptional(),
  });

  const schema3Factory = (users: string[]) =>
    z.object({
      name: stringCSVRequired(),
      age: numberCSVRequired(),
      description: stringCSVOptional(),
      leader: validUserCSVRequired(users),
      assignedTo: validUserCSVRequired(users),
    });

  const schema4 = z.object({
    name: stringCSVRequired(),
    age: numberCSVOptional(),
    description: stringCSVOptional(),
  });

  const schema5 = attachDueDateStartDateRefine(
    z.object({
      name: stringCSVRequired(),
      startDate: dateCSVRequired(),
      dueDate: dateCSVRequired(),
    })
  );

  it("should return no errors, headers and rows from CSV string for schema with requried fields", () => {
    const csv = `name,age
  John,20
  Doe,30`;
    const result = getRowsAndHeaderFromCSVContent(csv, schema1);
    expect(result.header).toEqual(["name", "age"]);
    expect(result.validRows).toStrictEqual([
      { name: "John", age: 20 },
      { name: "Doe", age: 30 },
    ]);
    expect(result.errors).toEqual({});
  });

  it("should return error when CSV's header row is not valid with schema", () => {
    const csv = `name
  John,20
  Doe,30`;
    const result = getRowsAndHeaderFromCSVContent(csv, schema1);
    expect(result.header).toEqual(["name"]);
    expect(result.validRows).toStrictEqual([
      { name: "John", age: 20 },
      { name: "Doe", age: 30 },
    ]);
    expect(result.errors).toEqual({
      header:
        "Corrupted headers. Missing headers: age. Expected headers: name, age",
    });
  });

  it("should return errors when CSV's row is empty", () => {
    const csv = `name,age
John,20
Doe,30
,,`;
    const result = getRowsAndHeaderFromCSVContent(csv, schema1);
    expect(result.header).toEqual(["name", "age"]);
    expect(result.validRows).toStrictEqual([
      { name: "John", age: 20 },
      { name: "Doe", age: 30 },
    ]);
    expect(result.errors).toEqual({
      "2": "name, age",
    });
  });

  it("should return error when CSV's row does not match schema", () => {
    const csv = `name,age
  John,20
  Doe,30
  Doe,wewr`;
    const result = getRowsAndHeaderFromCSVContent(csv, schema1);
    expect(result.header).toEqual(["name", "age"]);
    expect(result.validRows).toStrictEqual([
      { name: "John", age: 20 },
      { name: "Doe", age: 30 },
    ]);
    expect(result.errors).toEqual({
      "2": "age",
    });
  });

  it("should return error when CSV's row does not match schema, + when row has more columns than schema skip extra cells", () => {
    const csv = `name,age
  John,20
  Doe,30
  Doe,wewr,TEST`;
    const result = getRowsAndHeaderFromCSVContent(csv, schema1);
    expect(result.header).toEqual(["name", "age"]);
    expect(result.validRows).toStrictEqual([
      { name: "John", age: 20 },
      { name: "Doe", age: 30 },
    ]);
    expect(result.errors).toEqual({
      "2": "age",
    });
  });

  it("should return no errors, headers and from CSV body for schema with optional fields", () => {
    const csv = `name,age,description
  John,20,Test
  Doe,30
  Bill,30,`;
    const result = getRowsAndHeaderFromCSVContent(csv, schema2);
    expect(result.header).toEqual(["name", "age", "description"]);
    expect(result.validRows).toStrictEqual([
      { name: "John", age: 20, description: "Test" },
      { name: "Doe", age: 30, description: "" },
      { name: "Bill", age: 30, description: "" },
    ]);
    expect(result.errors).toEqual({});
  });

  it("should return no errors, headers and from CSV body for schema with optional fields 2", () => {
    const csv = `name,age,description
  John,20,Test
  Doe,,Test2
  Bill,30,`;
    const result = getRowsAndHeaderFromCSVContent(csv, schema4);
    expect(result.header).toEqual(["name", "age", "description"]);
    expect(result.validRows).toStrictEqual([
      { name: "John", age: 20, description: "Test" },
      { name: "Doe", age: null, description: "Test2" },
      { name: "Bill", age: 30, description: "" },
    ]);
    expect(result.errors).toEqual({});
  });

  it("should return no errors, headers and from CSV body for schema with dynamic validation for users", () => {
    const csv = `name,age,description,leader,assignedTo
      John,20,Test,John@test.pl,Doe@test.pl
      Doe,30,,Doe@test.pl,John@test.pl
      Bill,30,,Bill@test.pl,John@test.pl`;
    const result = getRowsAndHeaderFromCSVContent(
      csv,
      schema3Factory(["John@test.pl", "Doe@test.pl", "Bill@test.pl"])
    );
    expect(result.header).toEqual([
      "name",
      "age",
      "description",
      "leader",
      "assignedTo",
    ]);
    expect(result.validRows).toStrictEqual([
      {
        name: "John",
        age: 20,
        description: "Test",
        leader: "John@test.pl",
        assignedTo: "Doe@test.pl",
      },
      {
        name: "Doe",
        age: 30,
        description: "",
        leader: "Doe@test.pl",
        assignedTo: "John@test.pl",
      },
      {
        name: "Bill",
        age: 30,
        description: "",
        leader: "Bill@test.pl",
        assignedTo: "John@test.pl",
      },
    ]);
    expect(result.errors).toEqual({});
  });

  it("should return errors when CSV's row contains users that does not valid", () => {
    const csv = `name,age,description,leader,assignedTo
      John,20,Test,John@test.pl,Doe@test.pl
      Doe,30,,Doe@test.pl,John@test.pl
      Bill,30,,Bill@test.pl,John@test.pl`;
    const result = getRowsAndHeaderFromCSVContent(
      csv,
      schema3Factory(["John@test.pl", "Doe@test.pl", "Bill2@test.pl"])
    );
    expect(result.header).toEqual([
      "name",
      "age",
      "description",
      "leader",
      "assignedTo",
    ]);
    expect(result.validRows).toStrictEqual([
      {
        name: "John",
        age: 20,
        description: "Test",
        leader: "John@test.pl",
        assignedTo: "Doe@test.pl",
      },
      {
        name: "Doe",
        age: 30,
        description: "",
        leader: "Doe@test.pl",
        assignedTo: "John@test.pl",
      },
    ]);
    expect(result.errors).toEqual({
      "2": "leader",
    });
  });

  it("should return errors when dueDate is before startDate", () => {
    const csv = `name,startDate,dueDate
    John,2020-01-01,2020-01-02
    Doe,2020-01-01,2020-01-02
    Bill,2020-01-01,2020-01-02`;
    const result = getRowsAndHeaderFromCSVContent(csv, schema5);
    expect(result.header).toEqual(["name", "startDate", "dueDate"]);
    expect(result.validRows).toStrictEqual([
      {
        name: "John",
        startDate: "2020-01-01",
        dueDate: "2020-01-02",
      },
      {
        name: "Doe",
        startDate: "2020-01-01",
        dueDate: "2020-01-02",
      },
      {
        name: "Bill",
        startDate: "2020-01-01",
        dueDate: "2020-01-02",
      },
    ]);
    expect(result.errors).toEqual({});
  });

  it("should return errors when dueDate is after startDate or startDate is missing", () => {
    const csv = `name,startDate,dueDate
    John,2020-01-03,2020-01-02
    John,2020-01-02,2020-01-02
    Doe,2020-01-01,2020-01-02
    Doe,,2020-01-02
    Doe,2020-01-01,
    Bill,2020-01-03,2020-01-02`;
    const result = getRowsAndHeaderFromCSVContent(csv, schema5);
    expect(result.header).toEqual(["name", "startDate", "dueDate"]);
    expect(result.validRows).toStrictEqual([
      {
        name: "John",
        startDate: "2020-01-02",
        dueDate: "2020-01-02",
      },
      {
        name: "Doe",
        startDate: "2020-01-01",
        dueDate: "2020-01-02",
      },
    ]);
    expect(result.errors).toEqual({
      "0": "dueDate",
      "3": "startDate",
      "4": "dueDate",
      "5": "dueDate",
    });
  });
});
