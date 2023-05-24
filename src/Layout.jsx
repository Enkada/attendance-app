import { Outlet } from "../node_modules/react-router-dom/dist/index";
import Header from "./Header";

export default function Layout() {
    return (
        <>
            <Header></Header>
            <main>
                <Outlet></Outlet>
            </main>
        </>
    )
}