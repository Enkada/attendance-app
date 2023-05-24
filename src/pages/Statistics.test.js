import { getStudentStatRanges } from './Statistics';

test('Статистика студента за день', () => {
    let date = "10.10.23";

    const timetables = [
        { "date": "2023-10-10T06:00:00.000Z", "index": 3, "class": "Химия" },
        { "date": "2023-10-10T06:00:00.000Z", "index": 4, "class": "История" },
        { "date": "2023-10-10T06:00:00.000Z", "index": 5, "class": "Математика" },
    ]

    const passages = [
        { "datetime": "2023-10-10T11:20:00.000Z", "type": { "type": "Buffer", "data": [1] } },
        { "datetime": "2023-10-10T14:55:00.000Z", "type": { "type": "Buffer", "data": [0] } },
        { "datetime": "2023-10-10T07:20:00.000Z", "type": { "type": "Buffer", "data": [1] } },
        { "datetime": "2023-10-10T07:30:00.000Z", "type": { "type": "Buffer", "data": [0] } },
        { "datetime": "2023-10-10T07:05:00.000Z", "type": { "type": "Buffer", "data": [1] } },
        { "datetime": "2023-10-10T07:15:00.000Z", "type": { "type": "Buffer", "data": [0] } },
    ]

    let stat = getStudentStatRanges(timetables, passages, date);
    let classes = stat.classes;

    expect(classes[5].minutes).toBe(85);
    expect(!classes[1].isActive && !classes[2].isActive && classes[3].isActive && classes[4].isActive && classes[5].isActive).toBe(true);
    expect(!classes[1].isSkipped && !classes[2].isSkipped && classes[3].isSkipped && !classes[4].isSkipped && !classes[5].isSkipped).toBe(true);
    expect(classes[3].percentage).toBe(15 / 90);
    expect(stat.total.classCount).toBe(timetables.length);
    expect(stat.total.minutes).toBe(190);
    expect(stat.total.percentage).toBe(190 / (90 * timetables.length));
})

test('Статистика студента за день с игнорированием предметов', () => {
    let date = "10.10.23";

    const timetables = [
        { "date": "2023-10-10T06:00:00.000Z", "index": 3, "class": "Химия" },
        { "date": "2023-10-10T06:00:00.000Z", "index": 4, "class": "История" },
        { "date": "2023-10-10T06:00:00.000Z", "index": 5, "class": "Математика" },
    ]

    const passages = [
        { "datetime": "2023-10-10T18:20:00.000Z", "type": { "type": "Buffer", "data": [1] } },
        { "datetime": "2023-10-10T18:30:00.000Z", "type": { "type": "Buffer", "data": [0] } },
        { "datetime": "2023-10-10T11:20:00.000Z", "type": { "type": "Buffer", "data": [1] } },
        { "datetime": "2023-10-10T13:20:00.000Z", "type": { "type": "Buffer", "data": [0] } },
    ]

    const ignoredLessons = [ "Химия" ];

    let stat = getStudentStatRanges(timetables, passages, date, ignoredLessons);
    let classes = stat.classes;

    expect(classes[5].minutes).toBe(0);
    expect(!classes[1].isActive && !classes[2].isActive && !classes[3].isActive && classes[4].isActive && classes[5].isActive).toBe(true);
    expect(classes[3].isIgnored).toBe(true);
    expect(!classes[1].isSkipped && !classes[2].isSkipped && !classes[3].isSkipped && !classes[4].isSkipped && classes[5].isSkipped).toBe(true);
    expect(classes[3].percentage).toBe(undefined);
    expect(stat.total.classCount).toBe(timetables.length - ignoredLessons.length);
    expect(stat.total.minutes).toBe(90);
    expect(stat.total.percentage).toBe(90 / (90 * (timetables.length - ignoredLessons.length)));
})