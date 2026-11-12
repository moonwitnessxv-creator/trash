export type Tenant = {
  id: string;
  name: string;
};

export function createTenantPayload(name: string) {
  return {
    name: name.trim()
  };
}
