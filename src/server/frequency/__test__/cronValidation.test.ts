import { describe, expect, it } from "vitest";
import { CronQuartz } from "../cronValidation";

describe('cronValidation', () => {
    describe('CronQuartz', () => {
        const cron = [
            "0 0 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 ? * SUN,MON,TUE,WED,THU,FRI,SAT *",
            "0 0 14,15 ? * SUN,MON,TUE,WED,THU,FRI,SAT *",
            "0 0 10,11 ? * SUN,MON,TUE,WED,THU,FRI,SAT *",
            "0 0 22 ? * SAT *",
            "0 0 10,11,22 ? * SUN,MON,TUE,WED,THU,FRI,SAT *",
            "0 0 4,5,6 ? * SAT *",
            "0 0 4,5,6 ? * SUN,MON,TUE,WED,THU,FRI,SAT *",
            "0 0 14,15,16,17,18,19,20,21,22,23 ? * SAT *",
            "0 0 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 ? * SUN,MON,TUE,WED,THU,FRI,SAT *",
            "0 0 22 ? * SAT *",
            "0 0 10,11,22 ? * SUN,MON,TUE,WED,THU *",
            "0 0 1 ? * SUN *",
            "0 0 1,14,15 ? * SUN,MON,TUE,WED,THU,FRI,SAT *",
            "0 0 20,21,22 ? * SUN,MON,TUE,WED,THU,FRI,SAT *",
            "0 0 0,1,2,3,4,5,6,7,8,9 ? * SUN *",
            "0 0 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 ? * SUN,MON,TUE,WED,THU,FRI,SAT *",
            "0 0 1 ? * FRI *",
            "0 0 1,14,15 ? * SUN,MON,TUE,WED,THU *",
            "0 0 2,10,18 ? * MON,TUE,WED,THU,FRI *",
            "0 0 1 ? * SAT *",
            "0 0 1,9,17 ? * MON,TUE,WED,THU,FRI *",
            "0 0 22 ? * SUN *",
            "0 0 6,14,22 ? * MON,TUE,WED,THU,FRI *",
        ]
        it.each(cron)("cron: %s should be valid", (cron) => {
            expect(new CronQuartz().test(cron)).toBeTruthy()
        })
    })
})