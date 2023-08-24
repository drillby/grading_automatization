import { Client } from "akora-moodle";
import { BaseClientOptions } from "akora-moodle/dist/base";

export async function moodleClientFactory(creds: BaseClientOptions): Promise<Client> {
    return await Client.init(creds)
}