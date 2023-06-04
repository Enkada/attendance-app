import { Outlet } from "../node_modules/react-router-dom/dist/index";
import Header from "./Header";

export default function Layout() {
    return (
        <>
            <Header></Header>
            <main>
                <Outlet></Outlet>
            </main>
            <footer>Приложение для расчета статистики посещаемости студентов ИСПО <br /> Хорев Кирилл, 2023</footer>
        </>
    )
}