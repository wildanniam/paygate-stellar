export function createMppReplayStore(registryStore) {
  if (
    !registryStore?.getMppStoreValue ||
    !registryStore?.putMppStoreValue ||
    !registryStore?.deleteMppStoreValue
  ) {
    throw new Error('Registry store does not support MPP replay storage');
  }

  return {
    async get(key) {
      return registryStore.getMppStoreValue(key);
    },
    async put(key, value) {
      await registryStore.putMppStoreValue(key, value);
    },
    async delete(key) {
      await registryStore.deleteMppStoreValue(key);
    },
  };
}
