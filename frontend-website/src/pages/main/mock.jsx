export const mockPersons = [
  {
    id: 1,
    avatar: "https://i.pravatar.cc/150?img=1",
    lon: 105.8342, // Hà Nội
    lat: 21.0278,
    name: "Nguyễn Văn An",
    BirthDate: new Date("1985-03-12"),
    DeathDate: null,
    gender: "male",
    relationships: [
      { id: 2, type: "friend" },
      { id: 3, type: "colleague" },
      { id: 4, type: "family" }
    ]
  },
  {
    id: 2,
    avatar: "https://i.pravatar.cc/150?img=2",
    lon: 106.6297, // TP.HCM
    lat: 10.8231,
    name: "Trần Thị Bình",
    BirthDate: new Date("1990-07-21"),
    DeathDate: null,
    gender: "female",
    relationships: [
      { id: 1, type: "friend" },
      { id: 3, type: "friend" }
    ]
  },
  {
    id: 3,
    avatar: "https://i.pravatar.cc/150?img=3",
    lon: 108.2022, // Đà Nẵng
    lat: 16.0544,
    name: "Lê Hoàng Minh",
    BirthDate: new Date("1978-11-05"),
    DeathDate: null,
    gender: "male",
    relationships: [
      { id: 1, type: "colleague" },
      { id: 2, type: "friend" },
      { id: 5, type: "mentor" }
    ]
  },
  {
    id: 4,
    avatar: "https://i.pravatar.cc/150?img=4",
    lon: 105.1067, // Hải Phòng
    lat: 20.8449,
    name: "Nguyễn Thị Hương",
    BirthDate: new Date("1960-01-15"),
    DeathDate: null,
    gender: "female",
    relationships: [
      { id: 1, type: "family" }
    ]
  },
  {
    id: 5,
    avatar: "https://i.pravatar.cc/150?img=5",
    lon: 109.1967, // Nha Trang
    lat: 12.2388,
    name: "Phạm Đức Long",
    BirthDate: new Date("1950-09-09"),
    DeathDate: new Date("2020-02-02"),
    gender: "male",
    relationships: [
      { id: 3, type: "mentor" }
    ]
  }
];