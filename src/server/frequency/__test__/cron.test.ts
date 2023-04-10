import { describe, expect, it } from "vitest";
import { convertCronToUTC } from "../cron";

describe('cron', () => {
    describe('convertCronToUTC', () => {
        type HOURS = Parameters<typeof convertCronToUTC>[0];
        type DAYS = Parameters<typeof convertCronToUTC>[1];

        it("should not change hours if offset is 0", () => {
            const hours: HOURS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
            const days: DAYS = ["0", "1", "2", "3", "4", "5", "6"];
            const timezoneOffset = 0;

            const actual = convertCronToUTC(hours, days, timezoneOffset);
            expect(actual).toEqual(
                ["0 0 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 ? * SUN,MON,TUE,WED,THU,FRI,SAT *"]
            );
        })

        it("should not change hours if offset is 120", () => {
            const hours: HOURS = ["12", "13"];
            const days: DAYS = ["0", "1", "2", "3", "4", "5", "6"];
            const timezoneOffset = 120;

            const actual = convertCronToUTC(hours, days, timezoneOffset);
            expect(actual).toEqual(
                ["0 0 14,15 ? * SUN,MON,TUE,WED,THU,FRI,SAT *",]
            );
        })

        it("should not change hours if offset is -120", () => {
            const hours: HOURS = ["12", "13"];
            const days: DAYS = ["0", "1", "2", "3", "4", "5", "6"];
            const timezoneOffset = -120;

            const actual = convertCronToUTC(hours, days, timezoneOffset);
            expect(actual).toEqual(
                ["0 0 10,11 ? * SUN,MON,TUE,WED,THU,FRI,SAT *",]
            );
        })

        it('should create second cron if some hour + offset is negative 1', () => {
            const hours: HOURS = ["0", "12", "13"];
            const days: DAYS = ["0", "1", "2", "3", "4", "5", "6"];
            const timezoneOffset = -120;

            const actual = convertCronToUTC(hours, days, timezoneOffset);
            expect(actual).toEqual(
                [
                    "0 0 22 ? * SAT *",
                    "0 0 10,11,22 ? * SUN,MON,TUE,WED,THU,FRI *",
                    "0 0 10,11 ? * SAT *",
                ]
            );
        })

        it('should create second cron if some hour + offset is negative 2', () => {
            const hours: HOURS = ["0", "1", "2"];
            const days: DAYS = ["0", "1", "2", "3", "4", "5", "6"];
            // 20 hours
            const timezoneOffset = -1200;

            const actual = convertCronToUTC(hours, days, timezoneOffset);
            expect(actual).toEqual(
                [
                    "0 0 4,5,6 ? * SAT *",
                    "0 0 4,5,6 ? * SUN,MON,TUE,WED,THU,FRI *",
                ]
            );
        })

        it('should create second cron if some hour + offset is negative 3', () => {
            const hours: HOURS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
            const days: DAYS = ["0", "1", "2", "3", "4", "5", "6"];
            const timezoneOffset = -600;

            const actual = convertCronToUTC(hours, days, timezoneOffset);
            expect(actual).toEqual(
                [
                    "0 0 14,15,16,17,18,19,20,21,22,23 ? * SAT *",
                    "0 0 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 ? * SUN,MON,TUE,WED,THU,FRI *",
                    "0 0 0,1,2,3,4,5,6,7,8,9,10,11,12,13 ? * SAT *"
                ]
            );
        })

        it('should create second cron if some hour + offset is negative 4', () => {
            const hours: HOURS = ["0", "12", "13"];
            const days: DAYS = ["0", "1", "2", "3", "4"];
            const timezoneOffset = -120;

            const actual = convertCronToUTC(hours, days, timezoneOffset);
            expect(actual).toEqual(
                [
                    "0 0 22 ? * SAT *",
                    "0 0 10,11,22 ? * SUN,MON,TUE,WED *",
                    "0 0 10,11 ? * THU *",
                ]
            );
        })

        it('should create second cron if some hour + offset is positive 1', () => {
            const hours: HOURS = ["12", "13", '23'];
            const days: DAYS = ["0", "1", "2", "3", "4", "5", "6"];
            const offset = 120;

            const actual = convertCronToUTC(hours, days, offset);
            expect(actual).toEqual(
                [
                    "0 0 14,15 ? * SUN *",
                    "0 0 1,14,15 ? * MON,TUE,WED,THU,FRI,SAT *",
                    "0 0 1 ? * SUN *",
                ]
            );
        })

        it('should create second cron if some hour + offset is negative 2', () => {
            const hours: HOURS = ["0", "1", "2"];
            const days: DAYS = ["0", "1", "2", "3", "4", "5", "6"];
            // 20 hours
            const timezoneOffset = 1200;

            const actual = convertCronToUTC(hours, days, timezoneOffset);
            expect(actual).toEqual(
                [
                    "0 0 20,21,22 ? * SUN,MON,TUE,WED,THU,FRI,SAT *",
                ]
            );
        })

        it('should create second cron if some hour + offset is positive 3', () => {
            const hours: HOURS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
            const days: DAYS = ["0", "1", "2", "3", "4", "5", "6"];
            const timezoneOffset = 600;

            const actual = convertCronToUTC(hours, days, timezoneOffset);
            expect(actual).toEqual(
                [
                    "0 0 10,11,12,13,14,15,16,17,18,19,20,21,22,23 ? * SUN *",
                    "0 0 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 ? * MON,TUE,WED,THU,FRI,SAT *",
                    "0 0 0,1,2,3,4,5,6,7,8,9 ? * SUN *",
                ]
            );
        })

        it('should create second cron if some hour + offset is positive 1', () => {
            const hours: HOURS = ["12", "13", '23'];
            const days: DAYS = ["0", "1", "2", "3", "4"];
            const offset = 120;

            const actual = convertCronToUTC(hours, days, offset);
            expect(actual).toEqual(
                [
                    "0 0 14,15 ? * SUN *",
                    "0 0 1,14,15 ? * MON,TUE,WED,THU *",
                    "0 0 1 ? * FRI *",
                ]
            );
        })

        describe('business cases', () => {
            it('frequency from monday to friday at 00:00 08:00 16:00 timezone -2', () => {
                const hours: HOURS = ["0", "8", "16"];
                const days: DAYS = ["1", "2", "3", "4", "5"];
                const offset = 120;

                const actual = convertCronToUTC(hours, days, offset);
                expect(actual).toEqual(
                    [
                        "0 0 2,10,18 ? * MON,TUE,WED,THU,FRI *",
                    ]
                );
            })

            it('frequency from monday to friday at 07:00 15:00 23:00 timezone -2', () => {
                const hours: HOURS = ["7", "15", "23"];
                const days: DAYS = ["1", "2", "3", "4", "5"];
                const offset = 120;

                const actual = convertCronToUTC(hours, days, offset);
                expect(actual).toEqual(
                    [
                        "0 0 9,17 ? * MON *",
                        "0 0 1,9,17 ? * TUE,WED,THU,FRI *",
                        "0 0 1 ? * SAT *",
                    ]
                );
            })


            it('frequency from monday to friday at 00:00 08:00 16:00 timezone +2', () => {
                const hours: HOURS = ["0", "8", "16"];
                const days: DAYS = ["1", "2", "3", "4", "5"];
                const offset = -120;

                const actual = convertCronToUTC(hours, days, offset);
                expect(actual).toEqual(
                    [
                        "0 0 22 ? * SUN *",
                        "0 0 6,14,22 ? * MON,TUE,WED,THU *",
                        "0 0 6,14 ? * FRI *",
                    ]
                );
            })

            it('frequency from monday to friday at 00:00 01:00 02:00 08:00 16:00 timezone +4', () => {
                const hours: HOURS = ["0", "1", "2", "8", "16"];
                const days: DAYS = ["1", "2", "3", "4", "5"];
                const offset = -240;

                const actual = convertCronToUTC(hours, days, offset);
                expect(actual).toEqual(
                    [
                        "0 0 20,21,22 ? * SUN *",
                        "0 0 4,12,20,21,22 ? * MON,TUE,WED,THU *",
                        "0 0 4,12 ? * FRI *",
                    ]
                );
            })
        })
    })
})