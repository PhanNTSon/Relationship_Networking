import { useContext, useState } from "react"
import { supabase } from "../../components/supabaseClient";
import { useNavigate } from "react-router-dom"
import { AppCtx } from "../../context/AppContext";
export default function LoginPage() {
    return (
        <div id="login-page" style={styles.page}>
            <LoginBox />
        </div>
    );
}

function LoginBox() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { setJwt } = useContext(AppCtx);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        setLoading(false);

        if (error) {
            alert("Đăng nhập thất bại: " + error.message);
            return;
        }

        if (data?.session) {
            setJwt(data.session.access_token);
            navigate("/main");
        }
    };

    return (
        <form id="login-box" style={styles.box} onSubmit={handleLogin}>
            <h2>Đăng nhập</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
            />

            <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
            />

            <button type="submit" disabled={loading} style={styles.button}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
        </form>
    );
}

const styles = {
    page: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f5f5f5"
    },
    box: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        padding: "30px",
        background: "white",
        borderRadius: "10px",
        width: "300px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
    },
    input: {
        padding: "10px",
        fontSize: "14px"
    },
    button: {
        padding: "10px",
        cursor: "pointer"
    }
};