import { createContext, useState } from "react"

/**
 * @typedef {Object} Relationship
 * @property {String|Number} id - Mã định danh của người khác
 * @property {String} type - Loại mối quan hệ 
 */

/**
 * @typedef {Object} Person
 * @property {string|number} id - Mã định danh duy nhất của người dùng.
 * @property {string} avatar - Đường dẫn (URL) tới ảnh đại diện.
 * @property {number} lon - Kinh độ (Longitude) hiển thị trên bản đồ.
 * @property {number} lat - Vĩ độ (Latitude) hiển thị trên bản đồ.
 * @property {string} [name] - Tên người dùng 
 * @property {Date} BirthDate - Ngày sinh của người dùng
 * @property {Date} DeathDate - Ngày mất của người dùng (nếu có)
 * @property {string} gender - Giới tính
 * @property {Relationship[]} relationships - Mảng chứa thông tin về các mối quan hệ của người dùng (ví dụ: bạn bè, gia đình, đồng nghiệp)
 */

/**
 * Định nghĩa cấu trúc dữ liệu của toàn bộ App Context
 * @typedef {Object} AppContextType
 * @property {string} jwt - JSON Web Token dùng để xác thực API.
 * @property {React.Dispatch<React.SetStateAction<string>>} setJwt - Hàm cập nhật JWT.
 * @property {Person[]} persons - Danh sách dữ liệu người dùng trên bản đồ.
 * @property {React.Dispatch<React.SetStateAction<Person[]>>} setPersons - Hàm cập nhật danh sách người dùng.
 * @property {string} role - Vai trò của người dùng hiện tại (VD: 'admin', 'guest').
 * @property {React.Dispatch<React.SetStateAction<string>>} setRole - Hàm cập nhật vai trò.
 */

export const AppCtx = createContext(null)

export function AppProvider({ children }) {
    const [jwt, setJwt] = useState("")
    const [persons, setPersons] = useState([])
    const [role, setRole] = useState("")

    const value = {
        jwt,
        setJwt,
        persons,
        setPersons,
        role,
        setRole
    }

    return (
        <AppCtx.Provider value={value}>
            {children}
        </AppCtx.Provider>
    )
}