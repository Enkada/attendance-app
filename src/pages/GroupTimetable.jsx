import { useParams } from "../../node_modules/react-router-dom/dist/index";
import { axios } from '../../node_modules/@bundled-es-modules/axios';
import $ from 'jquery';
import moment from 'moment';

const weekNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

export default function GroupTimetable() {
    
    function firstDayOfWeek (year, week) {

        // Jan 1 of 'year'
        var d = new Date(year, 0, 1),
            offset = d.getTimezoneOffset();
    
        // ISO: week 1 is the one with the year's first Thursday 
        // so nearest Thursday: current date + 4 - current day number
        // Sunday is converted from 0 to 7
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    
        // 7 days * (week - overlapping first week)
        d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000 
            * (week + (year == d.getFullYear() ? -1 : 0 )));
    
        // daylight savings fix
        d.setTime(d.getTime() 
            + (d.getTimezoneOffset() - offset) * 60 * 1000);
    
        // back to Monday (from Thursday)
        d.setDate(d.getDate() - 3);
    
        return d;
    }
    
    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    
    const { name } = useParams();
    let timetableData = [];
    axios.get(`/timetables/${name}`).then(response => {
        timetableData = response.data.data;
        
        //console.log(timetableData);
        let uniqueWeeks = [];
        timetableData.forEach(day => {
            let date = new Date(day.date);
            let startDate = new Date(date.getFullYear(), 0, 1);
            var days = Math.floor((date - startDate) /
                (24 * 60 * 60 * 1000));
                
            var weekNumber = Math.ceil(days / 7);

            day.week = weekNumber;
            day.date = Date.parse(day.date);
            if (!uniqueWeeks.includes(weekNumber)) 
                uniqueWeeks.push(weekNumber);
        });

        //console.log(timetableData, uniqueWeeks);

        $('.timetable').empty();
        uniqueWeeks.forEach(weekNumber => {
            let currentDate = firstDayOfWeek(2022, weekNumber) * 1;
            let weekBlock = $('<div>', { class: 'week' }).appendTo('.timetable');
            for (let index = 0; index < 6; index++) {
                let dayClasses = timetableData.filter(x => x.date == currentDate);

                let dayBlock = $('<div>', { class: 'day' }).appendTo(weekBlock);
                let dateString = weekNames[moment(currentDate).day() - 1] + ' ' + moment(currentDate).format("DD/MM/YYYY");
                $('<div>', { class: 'day__date', text: dateString }).appendTo(dayBlock);
                let dayClassList = $('<div>', { class: 'day__class-list' }).appendTo(dayBlock);

                for (let classIndex = 1; classIndex <= 5; classIndex++) {
                    const classData = dayClasses.find(x => x.index == classIndex);
                    let classBlock = $('<div>', { class: 'class' }).appendTo(dayClassList);
                    $('<div>', { class: 'class__index', text: classIndex }).appendTo(classBlock);
                    $('<div>', { class: 'class__name', text: classData?.class ?? '' }).appendTo(classBlock);
                }

                currentDate += 86400000;
                //console.log(dayClasses, currentDate);
            }
        });
    });

    return (
        <>
            <div className="timetable"></div>
        </>
    )
}