import { Injectable } from "@angular/core";

@Injectable()
export class ConfigData {
  readonly SYNC_URL = "http://13.233.207.153:4984";
  // readonly SYNC_URL = "http://172.16.1.83:4984";
  // readonly SYNC_URL = "//115.166.142.154:4984";
  // readonly SYNC_URL = "http://localhost:4984";
  readonly DB_NAME = "testdb";
}
