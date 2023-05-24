import { axios } from '../../node_modules/@bundled-es-modules/axios';
import * as XLSX from '../../node_modules/xlsx';
import $ from 'jquery';
import moment from 'moment';
import PizZip from 'pizzip';
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { useState } from 'react';
import { useEffect } from 'react';


export default function ImportPage() {      
    const [groups, setGroups] = useState(() => { 
        console.log('initial groups');
        return [{ name: "test" }]; 
    });
    const [students, setStudents] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [passages, setPassages] = useState([]);
    
    const [importSections, setImportSectiions] = useState({
        xlsx: {
            counter: {
                groups: 0, students: 0
            },
            getStatus: function() { 
                return `Групп: ${this.counter.groups}, Студентов: ${this.counter.students}`; 
            },
            request: function() {
                axios.get('/groups').then(response => {
                    setGroups((prev) => response.data.data);          
                });
        
                axios.get('/students').then(response => {
                    setStudents((prev) => response.data.data);
                });
            },
            delete: function() {
                
                console.log('delete', index1);
                setStudents([]);
                setGroups([]);
                axios.delete('/groups');
                axios.delete('/students');
            },
            isLoading: true,
            icon: "groups",
            title: "Контингент (.xlsx)",
            accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        },
        htm: {
            counter: 0,
            getStatus: function() { 
                return `Расписаний: ${this.counter}`; 
            },
            request: function() {
                axios.get('/timetables').then(response => {
                    setTimetable([...timetable, ...response.data.data]);            
                });
            },
            delete: function() {
                setTimetable([]);
                axios.delete('/timetables');
            },
            isLoading: true,
            icon: "event_note",
            title: "Расписание (.htm)",
            accept: "text/html"
        },
        docx: {
            counter: 0,
            getStatus: function() { 
                return `Проходов: ${this.counter}`; 
            },
            request: function() {
                axios.get('/passages').then(response => {
                    setPassages([...passages, ...response.data.data]);            
                });
            },
            delete: function() {
                setPassages([]);
                axios.delete('/passages');
            },
            isLoading: true,
            icon: "badge",
            title: "Проходы (.docx)",
            accept: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        },
    });
    
    const handleImportXLSX = (e) => {
        e.preventDefault();

        let files = e.target.files, f = files[0];
        let reader = new FileReader();
        reader.onload = function (e) {
            let data = e.target.result;
            let workbook = XLSX.read(data, {type: 'binary'});

            axios.delete('/groups').then(() => {
                axios.delete('/students').then(() => {
                    let groupSize = workbook.SheetNames.length - 1;
                    let groupIndex = 0;

                    let newState = {...importSections};
                    newState.xlsx.isLoading = true;
                    setImportSectiions(newState);

                    for (const sheetName of workbook.SheetNames) {
                        if (sheetName == 'ОТЧИСЛЕННЫЕ') continue;
                        console.log('group', sheetName);
        
                        axios.post('/groups', { name: sheetName, year: sheetName[0] }).then(response => {    
                            let worksheet = workbook.Sheets[sheetName];
                            const groupStudentsData = XLSX.utils.sheet_to_json(worksheet);

                            let studentSize = groupStudentsData.length;
                            let studentIndex = 0;
                            for (const student of groupStudentsData) {  
                                let studentData = { fullname: student['ФИО'].trim(), group_id: response.data.results.insertId };
                                axios.post('/students', studentData).then(function (response) {
                                    studentIndex++;            
                                    //console.log('student', studentIndex, studentSize);                  

                                    if (studentIndex == studentSize) {
                                        groupIndex++;
                                        //console.log('group', groupIndex, groupSize);

                                        if (groupIndex == groupSize) {
                                            console.log('complete');

                                            importSections.xlsx.request();
                                        }
                                    }
                                });  
                            }
                        });
                    }
                });
            });

        };
        reader.readAsBinaryString(f)
    }

    useEffect(() => {
        console.log('useEffect ran');
        importSections.xlsx.request();
        importSections.htm.request();
        importSections.docx.request();
    }, []);  

    let index1 = 0;

    useEffect(() => {
        let newState = {...importSections};
        newState.xlsx.counter.groups = groups.length;        
        newState.xlsx.isLoading = false;
        setImportSectiions(newState);

        setTimeout(() => {
            let newGroups = [...groups];
            console.log('new', newGroups, ++index1);
        }, 2000);
    }, [groups]);

    useEffect(() => {
        let newState = {...importSections};
        newState.xlsx.counter.students = students.length;        
        newState.xlsx.isLoading = false;
        setImportSectiions(newState);
    }, [students]);

    useEffect(() => {
        let newState = {...importSections};
        newState.htm.counter = timetable.length;        
        newState.htm.isLoading = false;
        setImportSectiions(newState);
    }, [timetable]);

    useEffect(() => {
        let newState = {...importSections};
        newState.docx.counter = passages.length;        
        newState.docx.isLoading = false;
        setImportSectiions(newState);
    }, [passages]);

    const handleImportHTM = (e) => {
        console.log('HTML', groups);
        let files = e.target.files, f = files[0];
        

        let fr = new FileReader();
        fr.onload = () => {
            let timetableData = $(fr.result);            
            
            axios.delete('/timetables').then(() => {
                let size = timetableData.find('p').length;

                let newState = {...importSections};
                newState.htm.isLoading = true;
                setImportSectiions(newState);
                
                setTimeout(() => {
                    importSections.htm.request();
                }, 5000);

                for (let index = 0; index < size; index++) {
                    const title = $(timetableData.find('p font')[index]).html();
                    const titleMatch = title.match(/РАСПИСАНИЕ ГРУППЫ (.*?) неделя  с (.*?) по (.*)/);
                    const groupName = titleMatch[1].replace('/', '-');
                    const dateStart = moment(titleMatch[2], "DD/MM/YYYY");
                    const dateEnd = moment(titleMatch[2], "DD/MM/YYYY");

                    if (!groups.some(x => x.name == groupName)) {
                        continue;
                    }

                    let timetable = [{date: dateStart.toDate(), classes: {}}];

                    for (let i = 1; i < 6; i++) {
                        timetable.push({ date: dateStart.add('days', 1).toDate(), classes: {}});
                    }

                    const table = timetableData.find('table tbody')[index];
                    $(table).find('tr:not(:first-of-type)').each(function (i, value) {
                        let classIndex = $(value).find('td:first-of-type').html();
                        $(value).find('td:nth-child(n + 3)').each(function (i, value) {
                            let className = $(value).html() == '-------' ? null : $(value).html();
                            timetable[i].classes[classIndex] = className;
                        }); 
                    });           

                    timetable.forEach(day => {
                        let notNullCounter = 0;
                        Object.keys(day.classes).forEach(classIndex => {
                            if (day.classes[classIndex]) notNullCounter++
                        });

                        if (notNullCounter > 0) {
                            axios.post('/timetables', { group: groupName, date: moment(day.date).format('YYYY-MM-DD') }).then(response => { 
                                Object.keys(day.classes).forEach(classIndex => {
                                    if (day.classes[classIndex]) {
                                        axios.post(`/timetables/${response.data.results.insertId}`, { index: classIndex, class: day.classes[classIndex] });
                                    }
                                });                                 
                            });
                                                    
                        }
                    }); 
                }        
            }); 
            
        }
        fr.readAsText(f, 'CP1251');
    }

    const handleImportDOCX = (e) => {
        
        let newState = {...importSections};
        newState.docx.isLoading = true;
        setImportSectiions(newState);

        setTimeout(() => {
            importSections.docx.request();
        }, 5000);
        
        for (let index = 0; index < e.target.files.length; index++) {
            const f = e.target.files[index];
            let reader = new FileReader();
            reader.onload = function (e) {
                let data = e.target.result;
                
                const zip = new PizZip(data);
                const xml = str2xml(zip.files["word/document.xml"].asText());

                const paragraphsXml = xml.getElementsByTagName("w:p");
                let prevParagraphs = [];
                let studentName = null;

                for (let i = 0, len = paragraphsXml.length; i < len; i++) {
                    let fullText = "";
                    const textsXml =
                        paragraphsXml[i].getElementsByTagName("w:t");
                    for (let j = 0, len2 = textsXml.length; j < len2; j++) {
                        const textXml = textsXml[j];
                        if (textXml.childNodes) {
                            fullText += textXml.childNodes[0].nodeValue;
                        }
                    }

                    if (fullText.includes('Дата:')) {
                        if (!studentName) {
                            studentName = prevParagraphs[0];
                            prevParagraphs[0].match(/ [а-я]/g).forEach((match) => {
                                studentName = studentName.replace(match, match.trim());
                            });
                            //console.log(studentName.trim());

                            let studentData = students.find(x => x.fullname == studentName.trim());
                            if (!studentData) {
                                console.log('NOT FOUND STUDENT', studentName.trim());
                                break;
                            }
                            else {
                                console.log(studentData.id);
                            }
                        }
                        let passageMatch = fullText.match(/Дата: (.*); Время: (.*); Область: (.*)/);
                        let dateTime = moment(`${passageMatch[1]} ${passageMatch[2]}`, "DD.MM.YYYY HH:mm:ss").format('YYYY-MM-DD HH:mm:ss');
                        let isEnter = prevParagraphs[2].includes('вход');
                        //console.log(dateTime, isEnter * 1, passageMatch[3]);
                        axios.post('/passages', { student: studentName.trim(), building: passageMatch[3], datetime: dateTime, type: isEnter * 1 });
                    }
                    
                    prevParagraphs[2] = prevParagraphs[1];
                    prevParagraphs[1] = prevParagraphs[0];
                    prevParagraphs[0] = fullText;
                }
            };
            reader.readAsBinaryString(f)
        }

        
    }

    function str2xml(str) {
        if (str.charCodeAt(0) === 65279) {
            // BOM sequence
            str = str.substr(1);
        }
        return new DOMParser().parseFromString(str, "text/xml");
    }

    return (
        <>
            <h1>Импорт данных</h1>
            <section>
                <div className='import-form'>
                    {Object.keys(importSections).map((section) => (
                        <div className="import-form__section" key={section}>
                            <div className="import-form__section__title"><span className="material-icons">{importSections[section].icon}</span>{importSections[section].title}</div>
                            {importSections[section].isLoading ? <div className="loading">Загрузка</div> :
                                importSections[section].counter > 0 || importSections[section].counter?.students > 0 ? <>
                                    <div className="import-form__section__counter">{importSections[section].getStatus()}</div>
                                    <span className="material-icons btn" onClick={(e) => importSections[section].delete(e)}>delete</span>
                                </> :
                                    section != "xlsx" ? 
                                        groups.length > 0 ?
                                            <input type="file" accept={importSections[section].accept} onChange={
                                                section == "xlsx" ? (e) => handleImportXLSX(e) : section == "htm" ? (e) => handleImportHTM(e) : (e) => handleImportDOCX(e)
                                            } multiple={section == "docx"}/> 
                                        : <div className="gray">Загрузите контингент</div>
                                    :
                                        <input type="file" accept={importSections[section].accept} onChange={
                                            section == "xlsx" ? (e) => handleImportXLSX(e) : section == "htm" ? (e) => handleImportHTM(e) : (e) => handleImportDOCX(e)
                                        } multiple={section == "docx"}/> 
                        
                            }                            
                                                 
                        </div>
                    ))}
                </div>
            </section>
        </>
    )
}