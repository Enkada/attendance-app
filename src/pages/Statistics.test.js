import { getStudentStatRanges, getStudentStatRangesPeriod, getStudentGroupStatRanges, getStudentGroupStatRangesPeriod } from './Statistics';

const timetables = [
    { group_id: 5, "date": "2023-10-10T06:00:00.000Z", "index": 3, "class": "Химия" },
    { group_id: 5, "date": "2023-10-10T06:00:00.000Z", "index": 4, "class": "История" },
    { group_id: 5, "date": "2023-10-10T06:00:00.000Z", "index": 5, "class": "Математика" },
    { group_id: 5, "date": "2023-10-11T06:00:00.000Z", "index": 1, "class": "Русский язык" },
    { group_id: 5, "date": "2023-10-11T06:00:00.000Z", "index": 2, "class": "Информатика" },
    { group_id: 15, "date": "2023-10-11T06:00:00.000Z", "index": 4, "class": "История" },
    { group_id: 15, "date": "2023-10-11T06:00:00.000Z", "index": 5, "class": "Литература" },
]

const students = [
    { id: 10, group_id: 5, group: "119/1" },
    { id: 20, group_id: 5, group: "119/1" },
    { id: 30, group_id: 15, group: "219/2" },
    { id: 40, group_id: 20, group: "319/3" },
]

const passages = [
    { "student_id": 10, "datetime": "2023-10-10T11:20:00.000Z", "type": { "type": "Buffer", "data": [1] } },
    { "student_id": 10, "datetime": "2023-10-10T14:55:00.000Z", "type": { "type": "Buffer", "data": [0] } },
    { "student_id": 10, "datetime": "2023-10-10T07:20:00.000Z", "type": { "type": "Buffer", "data": [1] } },
    { "student_id": 10, "datetime": "2023-10-10T07:30:00.000Z", "type": { "type": "Buffer", "data": [0] } },
    { "student_id": 10, "datetime": "2023-10-10T07:05:00.000Z", "type": { "type": "Buffer", "data": [1] } },
    { "student_id": 10, "datetime": "2023-10-10T07:15:00.000Z", "type": { "type": "Buffer", "data": [0] } },
    { "student_id": 10, "datetime": "2023-10-11T06:55:00.000Z", "type": { "type": "Buffer", "data": [1] } },
    { "student_id": 10, "datetime": "2023-10-11T14:55:00.000Z", "type": { "type": "Buffer", "data": [0] } },
    { "student_id": 20, "datetime": "2023-10-10T18:20:00.000Z", "type": { "type": "Buffer", "data": [1] } },
    { "student_id": 20, "datetime": "2023-10-10T18:30:00.000Z", "type": { "type": "Buffer", "data": [0] } },
    { "student_id": 20, "datetime": "2023-10-10T11:20:00.000Z", "type": { "type": "Buffer", "data": [1] } },
    { "student_id": 20, "datetime": "2023-10-10T13:20:00.000Z", "type": { "type": "Buffer", "data": [0] } },
]

test('Расчет статистики студента за день', () => {
    let date = "10.10.23";   
    let student = students[0];
    
    let studentPassages = passages.filter(x => x.student_id == student.id);
    let studentTimetables = timetables.filter(x => x.group_id == student.group_id);

    let stat = getStudentStatRanges(studentTimetables, studentPassages, date);
    let classes = stat.classes;

    expect(classes[5].minutes).toBe(85);
    expect(!classes[1].isActive && !classes[2].isActive && classes[3].isActive && classes[4].isActive && classes[5].isActive).toBe(true);
    expect(!classes[1].isSkipped && !classes[2].isSkipped && classes[3].isSkipped && !classes[4].isSkipped && !classes[5].isSkipped).toBe(true);
    expect(classes[3].percentage).toBe(15 / 90);
    expect(stat.total.classCount).toBe(3);
    expect(stat.total.minutes).toBe(190);
    expect(stat.total.percentage).toBe(190 / (90 * 3));
})

test('Расчет статистики студента за день с игнорированием предметов', () => {
    let date = "10.10.23";
    let student = students[1];

    const ignoredLessons = [ "Химия" ];
    
    let studentPassages = passages.filter(x => x.student_id == student.id);
    let studentTimetables = timetables.filter(x => x.group_id == student.group_id);

    let stat = getStudentStatRanges(studentTimetables, studentPassages, date, ignoredLessons);
    let classes = stat.classes;

    expect(classes[5].minutes).toBe(0);
    expect(!classes[1].isActive && !classes[2].isActive && !classes[3].isActive && classes[4].isActive && classes[5].isActive).toBe(true);
    expect(classes[3].isIgnored).toBe(true);
    expect(!classes[1].isSkipped && !classes[2].isSkipped && !classes[3].isSkipped && !classes[4].isSkipped && classes[5].isSkipped).toBe(true);
    expect(classes[3].percentage).toBe(undefined);
    expect(stat.total.classCount).toBe(2);
    expect(stat.total.minutes).toBe(90);
    expect(stat.total.percentage).toBe(90 / (90 * (2)));
})

test('Расчет статистики студента за период', () => {
    let student = students[0];

    let period = { start: "10.10.23", end: "11.10.23" }
    
    let studentPassages = passages.filter(x => x.student_id == student.id);
    let studentTimetables = timetables.filter(x => x.group_id == student.group_id);

    let stats = getStudentStatRangesPeriod(studentTimetables, studentPassages, period);
    let statStart = getStudentStatRanges(studentTimetables, studentPassages, period.start);

    expect(stats.days["10.10.23"]).toEqual(statStart);
    expect(stats.days["11.10.23"].classes[1].minutes).toBe(35);
    expect(stats.total.minutes).toBe(315);
    expect(stats.total.classCount).toBe(5);
    expect(stats.total.skippedClassCount).toBe(2);
})

test('Расчет статистики студента за период с игнорированием предметов', () => {
    let student = students[0];

    let period = { start: "10.10.23", end: "11.10.23" }
    
    const ignoredLessons = [ "Химия" ];    
    
    let studentPassages = passages.filter(x => x.student_id == student.id);
    let studentTimetables = timetables.filter(x => x.group_id == student.group_id);

    let stats = getStudentStatRangesPeriod(studentTimetables, studentPassages, period, ignoredLessons);
    let statStart = getStudentStatRanges(studentTimetables, studentPassages, period.start, ignoredLessons);

    expect(stats.days["10.10.23"]).toEqual(statStart);
    expect(stats.days["11.10.23"].classes[1].minutes).toBe(35);
    expect(stats.total.minutes).toBe(300);
    expect(stats.total.classCount).toBe(4);
    expect(stats.total.skippedClassCount).toBe(1);
})

test('Расчет статистики группы студентов за день', () => {
    let date = "10.10.23"
    let group = [students[0], students[1]];

    let stat = getStudentGroupStatRanges(group, timetables, passages, date); 

    let statFirst = getStudentStatRanges(
        timetables.filter(x => x.group_id == group[0].group_id), 
        passages.filter(x => x.student_id == group[0].id), 
        date
    );

    expect(stat.students[group[0].id]).toEqual(statFirst);
    expect(stat.students[group[1].id].total.classCount).toBe(3);
    expect(stat.students[group[0].id].classes[3].minutes).toBe(15);
    expect(stat.total.skippedClassCount).toBe(3);
    expect(stat.total.percentage).toBeCloseTo(0.546);
})

test('Расчет статистики группы студентов за день с игнорированием предметов', () => {
    let date = "10.10.23"
    let group = [students[0], students[1]];

    const ignoredLessons = [ "Химия" ];  

    let stat = getStudentGroupStatRanges(group, timetables, passages, date, ignoredLessons);  

    let statFirst = getStudentStatRanges(
        timetables.filter(x => x.group_id == group[0].group_id), 
        passages.filter(x => x.student_id == group[0].id), 
        date, ignoredLessons
    );

    expect(stat.students[group[0].id]).toEqual(statFirst);
    expect(stat.students[group[1].id].total.classCount).toBe(2);
    expect(stat.students[group[0].id].classes[3].minutes).toBe(0);
    expect(stat.total.skippedClassCount).toBe(1);
    expect(stat.total.percentage).toBeCloseTo(0.736);
})

test('Расчет статистики группы студентов за период', () => {
    let group = [students[0], students[1]];

    let period = { start: "10.10.23", end: "11.10.23" }

    let stats = getStudentGroupStatRangesPeriod(group, timetables, passages, period); 
    let statFirst = getStudentStatRanges(
        timetables.filter(x => x.group_id == group[0].group_id), 
        passages.filter(x => x.student_id == group[0].id), 
        period.start
    );    

    expect(stats.days["10.10.23"].students[group[0].id]).toEqual(statFirst);
    expect(stats.days["10.10.23"].students[group[0].id].total.classCount).toBe(3);
    expect(stats.days["10.10.23"].students[group[1].id].classes[3].minutes).toBe(15);
    expect(stats.total.percentage).toBeCloseTo(0.446);
})

test('Расчет статистики группы студентов за период с игнорированием предметов', () => {
    let group = [students[0], students[1]];

    let period = { start: "10.10.23", end: "11.10.23" }    
    const ignoredLessons = [ "Химия" ];  

    let stats = getStudentGroupStatRangesPeriod(group, timetables, passages, period, ignoredLessons); 
    let statFirst = getStudentStatRanges(
        timetables.filter(x => x.group_id == group[0].group_id), 
        passages.filter(x => x.student_id == group[0].id), 
        period.start, ignoredLessons
    );    

    expect(stats.days["10.10.23"].students[group[0].id]).toEqual(statFirst);
    expect(stats.days["10.10.23"].students[group[0].id].total.classCount).toBe(2);
    expect(stats.days["10.10.23"].students[group[1].id].classes[3].minutes).toBe(0);
    expect(stats.total.percentage).toBeCloseTo(0.541);
})