import moment from 'moment';

const classPeriods = {
    1: { start: 90, end: 180 },
    2: { start: 195, end: 285 },
    3: { start: 335, end: 425 },
    4: { start: 440, end: 530 },
    5: { start: 540, end: 630 },
}

export function getStudentStatRanges(timetables, passages, date, ignoredLessons = []) {
    date = moment(date, 'DD.MM.YY');
    let dayPassages = passages.filter(x => moment(x.datetime).isSame(date, 'day'));  

    let dayLessons = [];

    dayLessons = timetables.filter(x => moment(x.date).isSame(date, 'day'));

    let enterExitPairs = [];
    for (let index = 0; index < dayPassages.length; index++) {
        const passage = dayPassages[index];
        try {
            if (passage.type.data == 0) {
                let enterTime = moment(dayPassages[index - 1].datetime).minutes() + moment(dayPassages[index - 1].datetime).hours() * 60 - 450;
                let exitTime = moment(dayPassages[index].datetime).minutes() + moment(dayPassages[index].datetime).hours() * 60 - 450;
                enterExitPairs.push({ exit: exitTime, enter: enterTime });
            }
        }
        catch {

        }
    }

    let rangeSet = [];

    let classesStats = {
        1: { minutes: 0, ranges: [], uncoveredRange: null, isSkipped: false, isActive: false },
        2: { minutes: 0, ranges: [], uncoveredRange: null, isSkipped: false, isActive: false },
        3: { minutes: 0, ranges: [], uncoveredRange: null, isSkipped: false, isActive: false },
        4: { minutes: 0, ranges: [], uncoveredRange: null, isSkipped: false, isActive: false },
        5: { minutes: 0, ranges: [], uncoveredRange: null, isSkipped: false, isActive: false },
    }

    let totalStats = {
        minutes: 0, percentage: 1, classCount: 0, skippedClassCount: 0
    }

    for (let i = 1; i <= 5; i++) {
        let classPeriod = classPeriods[i];

        let isIgnored = ignoredLessons.length > 0 && dayLessons.find(x => x.index == i) && ignoredLessons.includes(dayLessons.find(x => x.index == i).class);
        classesStats[i].isIgnored = isIgnored;

        if (isIgnored) {
            continue;
        }                 
        
        if (!dayLessons.find(x => x.index == i)) {
            continue;
        }
        else {
            classesStats[i].isActive = true;
            totalStats.classCount++;
        }

        for (let j = 0; j < enterExitPairs.length; j++) {
            const pair = enterExitPairs[j];
            if ((pair.enter < classPeriod.start && pair.exit < classPeriod.start) || 
                (pair.enter > classPeriod.end && pair.exit > classPeriod.end)) {
                continue;
            }

            let start = Math.max(pair.enter, classPeriod.start);
            let end = Math.min(pair.exit, classPeriod.end);

            classesStats[i].minutes += (end - start);
            classesStats[i].ranges.push({ start: start, end: end })

            if (!rangeSet.find(x => x.start == pair.enter && x.end == pair.exit))
                rangeSet.push({ start: pair.enter, end: pair.exit });
        }  

        classesStats[i].percentage = classesStats[i].minutes / 90;
        totalStats.minutes += classesStats[i].minutes;       

        if (classesStats[i].minutes < 75) {                
            totalStats.skippedClassCount++;
            classesStats[i].isSkipped = true;
        }

        if (classesStats[i].minutes == 0) 
            continue;
        
        let mainRange = {...classPeriods[i]};
        //classesStats[i].ranges.sort((a, b) => a.start - b.start);
        const gaps = [];

        let previousEnd = mainRange.start;
        for (const range of classesStats[i].ranges) {
            if (range.start > previousEnd) {
                gaps.push({ start: previousEnd, end: range.start });
            }
            previousEnd = Math.max(previousEnd, range.end);
        }

        if (previousEnd < mainRange.end) {
            gaps.push({ start: previousEnd, end: mainRange.end });
        }

        classesStats[i].uncoveredRange = gaps;
    }

    totalStats.percentage = Math.min(totalStats.minutes / (90 * totalStats.classCount), 1)
    totalStats.minutes = Math.min(totalStats.minutes, totalStats.classCount * 90);

    //console.log(date, dayPassages, dayLessons, { total: totalStats, classes: classesStats, ranges: rangeSet });
    return { total: totalStats, classes: classesStats, ranges: rangeSet, enterExitPairs: enterExitPairs };
}

export default {
    getStudentStatRanges
};
