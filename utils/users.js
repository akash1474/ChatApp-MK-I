const users = [];

const activeUsers = () => {
    return users.length;
};

const createUser = (id, username) => {
    const user = {
        id,
        username,
    };
    users.push(user);
    return user;
};

const getCurrentUser = (id) => {
    return users.find((user) => user.id === id);
};

const deleteUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room);
};
module.exports = {
    createUser,
    getCurrentUser,
    deleteUser,
    getUsersInRoom,
    activeUsers,
};
