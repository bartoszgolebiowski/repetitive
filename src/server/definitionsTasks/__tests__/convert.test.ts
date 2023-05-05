import { describe, expect, it } from "vitest";
import { groupDefinitionTasksByDefinitionIdAndSortedByAvailableFromAndEnabledOnlyFirstTaskOfSameType, groupDefinitionTasksByEveryDayAndSortByAvailableFrom } from "../convert";

describe('convert', () => {
    const parseStringToDate = (task: { id: string; status: string; createdAt: string; updatedAt: string; createdBy: string; updatedBy: string; availableFrom: string; availableTo: string; frequencyId: string; definitionId: string; definition: { id: string; name: string; description: string; createdAt: string; updatedAt: string; plantId: string; frequencyId: string; }; }): { availableFrom: Date; availableTo: Date; createdAt: Date; updatedAt: Date; definition: { createdAt: Date; updatedAt: Date; id: string; name: string; description: string; plantId: string; frequencyId: string; }; id: string; status: string; createdBy: string; updatedBy: string; frequencyId: string; definitionId: string; } => ({
        ...task,
        availableFrom: new Date(task.availableFrom),
        availableTo: new Date(task.availableTo),
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        definition: {
            ...task.definition,
            createdAt: new Date(task.definition.createdAt),
            updatedAt: new Date(task.definition.updatedAt),
        }
    });

    const input = [
        {
            "id": "clgb90ay200118ybo1dztmd0j",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-03T14:00:00.000Z",
            "availableTo": "2023-04-04T14:00:00.000Z",
            "frequencyId": "clgb8yx37000c8ybogkx35jhc",
            "definitionId": "clgb8zolq000t8ybouzrsn213",
            "definition": {
                "id": "clgb8zolq000t8ybouzrsn213",
                "name": "Sprawdzenie maszyny 001",
                "description": "Sprawdzenie maszyny 001",
                "createdAt": "2023-04-10T19:49:53.102Z",
                "updatedAt": "2023-04-10T19:49:53.102Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8yx37000c8ybogkx35jhc"
            }
        },
        {
            "id": "clgb90ay200128ybowcz8nwnn",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-04T14:00:00.000Z",
            "availableTo": "2023-04-05T14:00:00.000Z",
            "frequencyId": "clgb8yx37000c8ybogkx35jhc",
            "definitionId": "clgb8zolq000t8ybouzrsn213",
            "definition": {
                "id": "clgb8zolq000t8ybouzrsn213",
                "name": "Sprawdzenie maszyny 001",
                "description": "Sprawdzenie maszyny 001",
                "createdAt": "2023-04-10T19:49:53.102Z",
                "updatedAt": "2023-04-10T19:49:53.102Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8yx37000c8ybogkx35jhc"
            }
        },
        {
            "id": "clgb90ay200138ybog5s2pcpv",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-05T14:00:00.000Z",
            "availableTo": "2023-04-06T14:00:00.000Z",
            "frequencyId": "clgb8yx37000c8ybogkx35jhc",
            "definitionId": "clgb8zolq000t8ybouzrsn213",
            "definition": {
                "id": "clgb8zolq000t8ybouzrsn213",
                "name": "Sprawdzenie maszyny 001",
                "description": "Sprawdzenie maszyny 001",
                "createdAt": "2023-04-10T19:49:53.102Z",
                "updatedAt": "2023-04-10T19:49:53.102Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8yx37000c8ybogkx35jhc"
            }
        },
        {
            "id": "clgb90ay200148ybogu4jnkam",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-06T14:00:00.000Z",
            "availableTo": "2023-04-07T14:00:00.000Z",
            "frequencyId": "clgb8yx37000c8ybogkx35jhc",
            "definitionId": "clgb8zolq000t8ybouzrsn213",
            "definition": {
                "id": "clgb8zolq000t8ybouzrsn213",
                "name": "Sprawdzenie maszyny 001",
                "description": "Sprawdzenie maszyny 001",
                "createdAt": "2023-04-10T19:49:53.102Z",
                "updatedAt": "2023-04-10T19:49:53.102Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8yx37000c8ybogkx35jhc"
            }
        },
        {
            "id": "clgb90ay200158ybopk444l73",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-07T14:00:00.000Z",
            "availableTo": "2023-04-08T14:00:00.000Z",
            "frequencyId": "clgb8yx37000c8ybogkx35jhc",
            "definitionId": "clgb8zolq000t8ybouzrsn213",
            "definition": {
                "id": "clgb8zolq000t8ybouzrsn213",
                "name": "Sprawdzenie maszyny 001",
                "description": "Sprawdzenie maszyny 001",
                "createdAt": "2023-04-10T19:49:53.102Z",
                "updatedAt": "2023-04-10T19:49:53.102Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8yx37000c8ybogkx35jhc"
            }
        },
        {
            "id": "clgb90ay200168yboie5ogspc",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-08T14:00:00.000Z",
            "availableTo": "2023-04-09T14:00:00.000Z",
            "frequencyId": "clgb8yx37000c8ybogkx35jhc",
            "definitionId": "clgb8zolq000t8ybouzrsn213",
            "definition": {
                "id": "clgb8zolq000t8ybouzrsn213",
                "name": "Sprawdzenie maszyny 001",
                "description": "Sprawdzenie maszyny 001",
                "createdAt": "2023-04-10T19:49:53.102Z",
                "updatedAt": "2023-04-10T19:49:53.102Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8yx37000c8ybogkx35jhc"
            }
        },
        {
            "id": "clgb90ay200178yboc11etdqo",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-09T14:00:00.000Z",
            "availableTo": "2023-04-10T14:00:00.000Z",
            "frequencyId": "clgb8yx37000c8ybogkx35jhc",
            "definitionId": "clgb8zolq000t8ybouzrsn213",
            "definition": {
                "id": "clgb8zolq000t8ybouzrsn213",
                "name": "Sprawdzenie maszyny 001",
                "description": "Sprawdzenie maszyny 001",
                "createdAt": "2023-04-10T19:49:53.102Z",
                "updatedAt": "2023-04-10T19:49:53.102Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8yx37000c8ybogkx35jhc"
            }
        },
        {
            "id": "clgb90ay2001a8yboz3h2kno2",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-08T22:00:00.000Z",
            "availableTo": "2023-04-09T22:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001e8ybogkijsk5l",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-03T06:00:00.000Z",
            "availableTo": "2023-04-04T06:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001f8ybo2kkwrlw2",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-03T14:00:00.000Z",
            "availableTo": "2023-04-04T14:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001g8ybovam88781",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-03T22:00:00.000Z",
            "availableTo": "2023-04-04T22:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001h8yboioip08l3",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-04T06:00:00.000Z",
            "availableTo": "2023-04-05T06:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001i8ybo6jzc4xtn",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-04T14:00:00.000Z",
            "availableTo": "2023-04-05T14:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001j8yboor4vm8bt",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-04T22:00:00.000Z",
            "availableTo": "2023-04-05T22:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001k8ybo685ifcaz",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-05T06:00:00.000Z",
            "availableTo": "2023-04-06T06:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001l8ybopkf2ja1m",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-05T14:00:00.000Z",
            "availableTo": "2023-04-06T14:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001m8ybo0leb6bs1",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-05T22:00:00.000Z",
            "availableTo": "2023-04-06T22:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001n8ybop15fh51u",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-06T06:00:00.000Z",
            "availableTo": "2023-04-07T06:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001o8yboql2pqyzw",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-06T14:00:00.000Z",
            "availableTo": "2023-04-07T14:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001p8yboztzpg4ox",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-06T22:00:00.000Z",
            "availableTo": "2023-04-07T22:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001q8ybobx9ynbn2",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-07T06:00:00.000Z",
            "availableTo": "2023-04-08T06:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001r8ybohfb17qnz",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-07T14:00:00.000Z",
            "availableTo": "2023-04-08T14:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001s8ybou0mxkmyy",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-07T22:00:00.000Z",
            "availableTo": "2023-04-08T22:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001t8ybonxl6uo1q",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-09T06:00:00.000Z",
            "availableTo": "2023-04-10T06:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001u8ybozczkhx15",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-09T14:00:00.000Z",
            "availableTo": "2023-04-10T14:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001v8ybou0xzravj",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-09T22:00:00.000Z",
            "availableTo": "2023-04-10T22:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001y8ybopcvjtcjw",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-08T06:00:00.000Z",
            "availableTo": "2023-04-09T06:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay2001z8yboglwvjben",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-08T14:00:00.000Z",
            "availableTo": "2023-04-09T14:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb8zuxt000v8yboag9hdund",
            "definition": {
                "id": "clgb8zuxt000v8yboag9hdund",
                "name": "Sprawdzenie maszyny 002",
                "description": "Sprawdzenie maszyny 002",
                "createdAt": "2023-04-10T19:50:01.313Z",
                "updatedAt": "2023-04-10T19:50:01.313Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay200218ybot42izipx",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-08T22:00:00.000Z",
            "availableTo": "2023-04-09T22:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay300258ybo7zx6vgup",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-03T06:00:00.000Z",
            "availableTo": "2023-04-04T06:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay300268ybo46hqvsq4",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-03T14:00:00.000Z",
            "availableTo": "2023-04-04T14:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay300278yboiialwbqd",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-03T22:00:00.000Z",
            "availableTo": "2023-04-04T22:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay300288ybofw2q77hh",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-04T06:00:00.000Z",
            "availableTo": "2023-04-05T06:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay300298ybo14e6vjtf",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-04T14:00:00.000Z",
            "availableTo": "2023-04-05T14:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay3002a8ybokp63k22u",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-04T22:00:00.000Z",
            "availableTo": "2023-04-05T22:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay3002b8ybozmd9nqoi",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-05T06:00:00.000Z",
            "availableTo": "2023-04-06T06:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay3002c8yboq43zm4dh",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-05T14:00:00.000Z",
            "availableTo": "2023-04-06T14:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay3002d8ybozve2aa2q",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-05T22:00:00.000Z",
            "availableTo": "2023-04-06T22:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay3002e8ybov46n63vj",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-06T06:00:00.000Z",
            "availableTo": "2023-04-07T06:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay3002f8ybokp56bmoh",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-06T14:00:00.000Z",
            "availableTo": "2023-04-07T14:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay3002g8ybot23mw7ij",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-06T22:00:00.000Z",
            "availableTo": "2023-04-07T22:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay3002h8ybo5u3in1n4",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-07T06:00:00.000Z",
            "availableTo": "2023-04-08T06:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay3002j8ybomviho29k",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-07T22:00:00.000Z",
            "availableTo": "2023-04-08T22:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay3002k8ybovys6bgt9",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-09T06:00:00.000Z",
            "availableTo": "2023-04-10T06:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay3002l8yboulo5tmnk",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-09T14:00:00.000Z",
            "availableTo": "2023-04-09T14:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay3002m8ybo2022bkoj",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-09T22:00:00.000Z",
            "availableTo": "2023-04-10T22:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay3002p8yboc8w27z4s",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-08T06:00:00.000Z",
            "availableTo": "2023-04-09T06:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay3002q8ybok25a5f0b",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-08T14:00:00.000Z",
            "availableTo": "2023-04-09T14:00:00.000Z",
            "frequencyId": "clgb8z7fg000g8ybota1ion10",
            "definitionId": "clgb900io000x8ybo7disfxvf",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        },
        {
            "id": "clgb90ay3002r8yboape52edm",
            "status": "MISSING",
            "createdAt": "2023-04-10T19:50:22.058Z",
            "updatedAt": "2023-04-10T19:50:22.058Z",
            "createdBy": "SYSTEM",
            "updatedBy": "SYSTEM",
            "availableFrom": "2023-04-07T14:00:00.000Z",
            "availableTo": "2023-04-08T14:00:00.000Z",
            "frequencyId": "clgb8zfuy000o8ybog5wp1s68",
            "definitionId": "clgb908o2000z8ybodqy6ty1h",
            "definition": {
                "id": "clgb900io000x8ybo7disfxvf",
                "name": "Sprawdzenie maszyny 003",
                "description": "Sprawdzenie maszyny 003",
                "createdAt": "2023-04-10T19:50:08.545Z",
                "updatedAt": "2023-04-10T19:50:08.545Z",
                "plantId": "clgb8yo2g000b8ybo4ogew4em",
                "frequencyId": "clgb8z7fg000g8ybota1ion10"
            }
        }
    ].map(parseStringToDate)

    describe("groupDefinitionTasksByEveryDayAndSortByAvailableFrom", () => {
        it('this test is just a snapshot test to prevent regressions', () => {
            const result = groupDefinitionTasksByEveryDayAndSortByAvailableFrom(input)
            expect(result['Sprawdzenie maszyny 001']).toMatchSnapshot()
        })
    })

    describe("groupDefinitionTasksByDefinitionIdAndSortedByAvailableFromAndEnabledOnlyFirstTaskOfSameType", () => {
        it('this test is just a snapshot test to prevent regressions', () => {
            const result = groupDefinitionTasksByDefinitionIdAndSortedByAvailableFromAndEnabledOnlyFirstTaskOfSameType(
                input,
                new Date('Mon Apr 10 2023 22:30:23 GMT+0200 (Central European Summer Time)')
            )

            expect(result.filter(task => !task.derived.disabled)).toHaveLength(3)
            expect(result).toMatchSnapshot()
        })
    })
})