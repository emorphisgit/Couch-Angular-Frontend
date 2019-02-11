import { Injectable } from "@angular/core";

@Injectable()
export class ConfigData {
  readonly sync_url = "http://13.233.207.153:4984";
  // readonly sync_url = "http://172.16.1.83:4984";
  // readonly sync_url = "//115.166.142.154:4984";
  // readonly sync_url = "http://localhost:4984";
  readonly db_name = "testdb";
}
