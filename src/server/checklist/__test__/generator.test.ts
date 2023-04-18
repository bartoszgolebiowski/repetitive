import { describe, expect, it } from "vitest";
import { generateChecklistItems, type DefinitionWithFrequency } from "../generator";

describe('checklist generator', () => {
    describe('generateChecklistItems', () => {
        describe('simple definitions', () => {
            const simpleDefinitions = [
                {
                    id: "clffdrshm00008y4cfeukqe9a",
                    name: "Napić się wody",
                    description: "Napić się 2 litrów wody",
                    "frequencyId": "clffdrshm00008y4cfeukqe9a",
                    createdAt: new Date("2021-03-13T00:00:00.000Z"),
                    updatedAt: new Date("2021-03-13T00:00:00.000Z"),
                    workplaceId: "clffdrshm00008y4cfeukqe9a",
                    frequency: {
                        name: "3_PER_DAY",
                        frequencyCrons: [
                            {
                                cron: "0 0 0,8,16 ? * MON,TUE,WED,THU,FRI,SAT,SUN *",
                                id: "clffdrshm00008y4cfeukqe9a"
                            },
                        ]
                    }
                },
                {
                    id: "clffdrshm12348y4cfeukqe9a",
                    name: "Duolingo",
                    description: "Zrobić 10 minut ćwiczeń na Duolingo",
                    "frequencyId": "clfff6jpi00048y4conqcbcrg",
                    createdAt: new Date("2021-03-13T00:00:00.000Z"),
                    updatedAt: new Date("2021-03-13T00:00:00.000Z"),
                    workplaceId: "clffdrshm00008y4cfeukqe9a",
                    frequency: {
                        name: "1_PER_DAY",
                        frequencyCrons: [{ "cron": "0 0 23 ? * MON,TUE,WED,THU,FRI,SAT,SUN *", id: "clffdrshm00008y4cfeukqe9a" }]

                    }
                },
                {
                    id: "clffdrshm43218y4cfeukqe9a",
                    name: "Yoga",
                    description: "Yoga 30 minut",
                    "frequencyId": "clffkusf5000a8y4c597hxozl",
                    createdAt: new Date("2021-03-13T00:00:00.000Z"),
                    updatedAt: new Date("2021-03-13T00:00:00.000Z"),
                    workplaceId: "clffdrshm00008y4cfeukqe9a",
                    frequency: {
                        name: "1_PER_SATURDAY",
                        frequencyCrons: [{ "cron": "0 0 23 ? * SAT *", id: "clffdrshm00008y4cfeukqe9a" }]
                    }
                },
            ] satisfies DefinitionWithFrequency[]

            describe('date locale PL', () => {
                it('should generate checklist items for monday 00:00:00 to sunday 23:59:59:999 date range', () => {
                    const monday = new Date('Tue Mar 13 2023 01:00:00 GMT+0100 (Central European Standard Time)')
                    const sunday = new Date('Tue Mar 20 2023 00:59:59 GMT+0100 (Central European Standard Time)')

                    const [first, second, third] = generateChecklistItems(
                        monday,
                        sunday,
                        simpleDefinitions,
                    )

                    expect(first).toHaveLength(7 * 3)
                    expect(second).toHaveLength(7)
                    expect(third).toHaveLength(1)
                })

                it('should generate checklist items for sunday 00:00:00 to sunday 23:59:59:999 date range', () => {
                    const saturday = new Date('Tue Mar 19 2023 01:00:00 GMT+0100 (Central European Standard Time)')
                    const sunday = new Date('Tue Mar 20 2023 00:59:59 GMT+0100 (Central European Standard Time)')

                    const [first, second, third] = generateChecklistItems(
                        saturday,
                        sunday,
                        simpleDefinitions,
                    )

                    expect(first).toHaveLength(3)
                    expect(second).toHaveLength(1)
                    expect(third).toHaveLength(0)
                })
            })

            describe('date locale EN', () => {
                it('should generate checklist items for monday 00:00:00 to sunday 23:59:59:999 date range', () => {
                    const monday = new Date('Tue Mar 13 2023 00:00:00 GMT+0000 (Central European Standard Time)')
                    const sunday = new Date('Tue Mar 19 2023 23:59:59 GMT+0000 (Central European Standard Time)')

                    const [first, second, third] = generateChecklistItems(
                        monday,
                        sunday,
                        simpleDefinitions,
                    )

                    expect(first).toHaveLength(7 * 3)
                    expect(second).toHaveLength(7)
                    expect(third).toHaveLength(1)
                })

                it('should generate checklist items for sunday 00:00:00 to sunday 23:59:59:999 date range', () => {
                    const saturday = new Date('Tue Mar 19 2023 00:00:00 GMT+0000 (Central European Standard Time)')
                    const sunday = new Date('Tue Mar 19 2023 23:59:59 GMT+0000 (Central European Standard Time)')

                    const [first, second, third] = generateChecklistItems(
                        saturday,
                        sunday,
                        simpleDefinitions,
                    )

                    expect(first).toHaveLength(3)
                    expect(second).toHaveLength(1)
                    expect(third).toHaveLength(0)
                })
            })
        })

        describe('complex definitions', () => {
            const complexDefinitions = [
                {
                    id: "clffdrshm12348y4cfeukqe9a",
                    name: "Duolingo",
                    description: "Zrobić 10 minut ćwiczeń na Duolingo",
                    "frequencyId": "clfff6jpi00048y4conqcbcrg",
                    createdAt: new Date("2021-03-13T00:00:00.000Z"),
                    updatedAt: new Date("2021-03-13T00:00:00.000Z"),
                    workplaceId: "clffdrshm00008y4cfeukqe9a",
                    frequency: {
                        name: "from monday to friday at 00:00 08:00 16:00 timezone +2",
                        frequencyCrons: [
                            {
                                cron: "0 0 22 ? * SUN *",
                                id: "clffdrshm00008y4cfeukqe9a"
                            },
                            {
                                cron: "0 0 6,14,22 ? * MON,TUE,WED,THU,FRI *",
                                id: "clffdrshm00008y4cfeukqe9b"
                            },
                        ]
                    }
                },
                {
                    id: "clffdrshm43218y4cfeukqe9a",
                    name: "Yoga",
                    description: "Yoga 30 minut",
                    "frequencyId": "clffkusf5000a8y4c597hxozl",
                    createdAt: new Date("2021-03-13T00:00:00.000Z"),
                    updatedAt: new Date("2021-03-13T00:00:00.000Z"),
                    workplaceId: "clffdrshm00008y4cfeukqe9a",
                    frequency: {
                        name: "from monday to friday at 07:00 15:00 23:00 timezone -2",
                        frequencyCrons: [
                            {
                                cron: "0 0 1 ? * SAT *",
                                id: "clffdrshm00008y4cfeukqe9a"
                            },
                            {
                                cron: "0 0 1,9,17 ? * MON,TUE,WED,THU,FRI *",
                                id: "clffdrshm00008y4cfeukqe9b"
                            },
                        ]
                    }
                },
            ] satisfies DefinitionWithFrequency[]

            describe('date locale PL', () => {
                it('should generate checklist items for monday 00:00:00 to sunday 23:59:59:999 date range', () => {
                    const monday = new Date('Tue Mar 13 2023 01:00:00 GMT+0100 (Central European Standard Time)')
                    const sunday = new Date('Tue Mar 20 2023 00:59:59 GMT+0100 (Central European Standard Time)')

                    const [first, second] = generateChecklistItems(
                        monday,
                        sunday,
                        complexDefinitions,
                    )

                    expect(first).toHaveLength(5 * 3 + 1)
                    expect(second).toHaveLength(5 * 3 + 1)
                })

                it('should generate checklist items for sunday 00:00:00 to sunday 23:59:59:999 date range', () => {
                    const saturday = new Date('Tue Mar 19 2023 01:00:00 GMT+0100 (Central European Standard Time)')
                    const sunday = new Date('Tue Mar 20 2023 00:59:59 GMT+0100 (Central European Standard Time)')

                    const [first, second] = generateChecklistItems(
                        saturday,
                        sunday,
                        complexDefinitions,
                    )

                    expect(first).toHaveLength(1)
                    expect(second).toHaveLength(0)
                })
            })

            describe('date locale EN', () => {
                it('should generate checklist items for monday 00:00:00 to sunday 23:59:59:999 date range', () => {
                    const monday = new Date('Tue Mar 13 2023 00:00:00 GMT+0000 (Central European Standard Time)')
                    const sunday = new Date('Tue Mar 19 2023 23:59:59 GMT+0000 (Central European Standard Time)')

                    const [first, second] = generateChecklistItems(
                        monday,
                        sunday,
                        complexDefinitions,
                    )

                    expect(first).toHaveLength(5 * 3 + 1)
                    expect(second).toHaveLength(5 * 3 + 1)
                })

                it('should generate checklist items for sunday 00:00:00 to sunday 23:59:59:999 date range', () => {
                    const saturday = new Date('Tue Mar 19 2023 00:00:00 GMT+0000 (Central European Standard Time)')
                    const sunday = new Date('Tue Mar 19 2023 23:59:59 GMT+0000 (Central European Standard Time)')

                    const [first, second] = generateChecklistItems(
                        saturday,
                        sunday,
                        complexDefinitions,
                    )

                    expect(first).toHaveLength(1)
                    expect(second).toHaveLength(0)
                })
            })
        })

        describe('business definitions', () => {
            const businessDefinitions = [
                {
                    id: "clffdrshm12348y4cfeukqe9a",
                    name: "Ogledziny maszyny 1",
                    description: "Ogledziny maszyny 1",
                    "frequencyId": "clfff6jpi00048y4conqcbcrg",
                    createdAt: new Date("2021-03-13T00:00:00.000Z"),
                    updatedAt: new Date("2021-03-13T00:00:00.000Z"),
                    workplaceId: "clffdrshm00008y4cfeukqe9a",
                    frequency: {
                        name: "from monday to friday at 00:00 08:00 16:00 timezone +2",
                        frequencyCrons: [
                            {
                                cron: "0 0 22 ? * SUN *",
                                id: "clffdrshm00008y4cfeukqe9a"
                            },
                            {
                                cron: "0 0 6,14,22 ? * MON,TUE,WED,THU *",
                                id: "clffdrshm00008y4cfeukqe9b"
                            },
                            {
                                cron: "0 0 6,14 ? * FRI *",
                                id: "clffdrshm00008y4cfeukqe9c"
                            }
                        ]
                    }
                },
            ] satisfies DefinitionWithFrequency[]

            describe('date locale PL', () => {
                it('should generate checklist items for sunday 00:00:00 to moneday 00:00:00 date range', () => {
                    const sundayBeginning = new Date('Sun Mar 26 2023 02:00:00 GMT+0200 (Central European Summer Time)')
                    const sundayEnd = new Date('Mon Mar 27 2023 02:00:00 GMT+0200 (Central European Standard Time)')

                    const [first] = generateChecklistItems(
                        sundayBeginning,
                        sundayEnd,
                        businessDefinitions,
                    )

                    expect(first).toHaveLength(1)
                })

                it('should generate checklist items for monday 00:00:00 to tuesday 00:00:00 date range', () => {
                    const sundayBeginning = new Date('Mon Mar 27 2023 02:00:00 GMT+0200 (Central European Summer Time)')
                    const sundayEnd = new Date('Tue Mar 28 2023 02:00:00 GMT+0200 (Central European Standard Time)')

                    const [first] = generateChecklistItems(
                        sundayBeginning,
                        sundayEnd,
                        businessDefinitions,
                    )

                    expect(first).toHaveLength(3)
                })

                it('should generate checklist items for friday 00:00:00 to saturday 00:00:00 date range', () => {
                    const sundayBeginning = new Date('Fri Mar 31 2023 02:00:00 GMT+0200 (Central European Summer Time)')
                    const sundayEnd = new Date('Sat Apr 01 2023 02:00:00 GMT+0200 (Central European Standard Time)')

                    const [first] = generateChecklistItems(
                        sundayBeginning,
                        sundayEnd,
                        businessDefinitions,
                    )

                    expect(first).toHaveLength(2)
                })
            })

        })
    })
})