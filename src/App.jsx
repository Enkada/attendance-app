import { Route, Routes } from '../node_modules/react-router-dom/dist/index'
import Layout from './Layout'
import AdminPage from './pages/AdminPage'
import ImportPage from './pages/ImportPage'
import LoginPage from './pages/LoginPage'
import StatsPage from './pages/GroupListPage'
import GroupListPage from './pages/GroupListPage'
import GroupPage from './pages/GroupPage'
import StudentPage from './pages/StudentPage'
import TeacherListPage from './pages/TeacherListPage'
import { UserContextProvider } from './UserContext'
import StudentListPage from './pages/StudentListPage'

function App() {

    return (
        <UserContextProvider>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/" element={<Layout/>}>
                    <Route path="/admin" element={<AdminPage/>}/>
                    <Route path="/import" element={<ImportPage/>}/>
                    <Route path="/teachers" element={<TeacherListPage/>}/>
                    <Route path="/groups" element={<GroupListPage/>}/>
                    <Route path="/group/:name" element={<GroupPage/>}/>
                    <Route path="/student/:id/:name" element={<StudentPage/>}/>
                    <Route path="/students" element={<StudentListPage/>}/>
                </Route>
                <Route path="*" element={<div>404 Not Found</div>}/>
            </Routes>
        </UserContextProvider>
    )
}

export default App
