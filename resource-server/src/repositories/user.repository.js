export function userRepository() {
  const users = new Map();
  let nextId = 1;

  return {
    listBySub(userSub) {
      return users.get(userSub) ?? [];
    },

    add(userSub, { title }) {
      const user = {
        id: nextId++,
        title,
        createdAt: new Date().toString(),
      };
      users.set(userSub, [...(users.get(userSub) ?? []), user]);
      return user;
    },
  };
}
