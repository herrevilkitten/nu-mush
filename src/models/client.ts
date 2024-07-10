export function getClientURI(client: string, clientId: string) {
  return new URL(`${client}://${clientId}`).toString();
}
