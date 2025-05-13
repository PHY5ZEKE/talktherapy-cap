import { useEffect, useState } from "react";

import type { JwtPayload } from "jsonwebtoken";
import { http } from "utils/http";

export const useToken = () => {
    const [token, setToken] = useState<JwtPayload | null>(null);

    const checkToken = async () => {
        try {
            const response = await http("GET", "/api/auth/get-cookie");
            if (response) {
                setToken(response.data);
            }
        } catch (error) {
            console.error("Error getting cookie:", error);
        }
    }

    useEffect(() => {
        checkToken();
    }, []);

    return { token, checkToken };
}