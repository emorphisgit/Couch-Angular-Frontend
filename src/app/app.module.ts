import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { appRouter } from "./app.router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";
import { PouchDBService } from "./services/pouchdb.service";
import { HttpModule } from "@angular/http";
import { HomeComponent } from "./components/home/home.component";
import { ConfigData } from "./config";

@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    BrowserModule,
    appRouter
  ],
  providers: [PouchDBService, ConfigData],
  bootstrap: [AppComponent]
})
export class AppModule {}
