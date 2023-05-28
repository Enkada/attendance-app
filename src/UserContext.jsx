import {createContext, useEffect, useState} from "react";
import { axios } from '../node_modules/@bundled-es-modules/axios';
//import {data} from "autoprefixer";

export const UserContext = createContext({});

export function UserContextProvider({children}) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!user) {
            axios.get('/user').then(({data}) => {
                if (!data) {                    
                    setReady(true);
                    return;
                }
                
                data.is_admin = data.is_admin == 1
                setUser(data);
                setReady(true);
            });
        }
    }, []);
    return (
        <UserContext.Provider value={{user, setUser, ready}}>
            {children}
        </UserContext.Provider>
    );
}