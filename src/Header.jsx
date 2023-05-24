import { useContext, useState } from "react";
import { NavLink, Navigate } from "../node_modules/react-router-dom/dist/index";
import { axios } from '../node_modules/@bundled-es-modules/axios';
import { UserContext } from "./UserContext";

export default function Header() {
    const {user} = useContext(UserContext);
    const [redirect, setRedirect] = useState(false);

    function logout() {
        axios.post("/logout");
        setRedirect(true);
    }

    if (redirect) {
        return <Navigate to={"/login"}/>
    }

    return (
        <header>
            <div className="nav">
                <div className="nav__link-list">
                    <NavLink to={'/groups'} className="nav__link-list__item"><span className="material-icons">groups</span></NavLink>
                    {!!user?.is_admin && (<>
                        <NavLink to={'/import'} className="nav__link-list__item"><span className="material-icons">upload_file</span></NavLink>
                        <NavLink to={'/teachers'} className="nav__link-list__item"><span className="material-icons">supervisor_account</span></NavLink>
                        <NavLink to={'/students'} className="nav__link-list__item"><span className="material-icons">list</span></NavLink>
                    </>)}
                </div>
                <div className="nav__profile">
                    <div className="nav__profile__name">{user?.fullname}</div>
                    <div className="nav__profile__logout" onClick={logout}><span className="material-icons">logout</span></div>
                </div>
            </div>
        </header>
    )
}