import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { HeaderComponent } from "../../header/header.component";
import { invoke } from "@tauri-apps/api/tauri";
import { JiraSetting } from '../../shared/models/jira-setting';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';

@Component({
  selector: 'app-config-project',
  standalone: true,
  imports: [HeaderComponent, MatTableModule, ReactiveFormsModule, MatFormField],
  templateUrl: './config-project.component.html',
  styleUrl: './config-project.component.css'
})
export class ConfigProjectComponent implements OnInit {

  public displayedColumns: string[] = ['id', 'base_url', 'user_name', 'api_token'];
  public settingText: string = "";
  public jiraSettings: JiraSetting[] = [];
  public clickedRows: Set<JiraSetting>;
  public selectedRow: JiraSetting | null = null;;

  public jiraSettingForm = new FormGroup({
    id: new FormControl('', []),
    base_url: new FormControl('', []),
    user_name: new FormControl('', []),
    api_token: new FormControl('', []),
  });

  constructor() { 
    this.clickedRows = new Set<JiraSetting>();
    this.selectedRow = null;
  }

  ngOnInit(): void {
    invoke<string>("get_jira_settings").then((text) => {
      const temp = JSON.stringify(text);
      const temp2 = JSON.parse(temp);
      this.jiraSettings = temp2;
      console.log("-----------------");
      console.log(this.jiraSettings);
    });    
  }

  public selectRow($event: MouseEvent, row: JiraSetting): void {
    this.selectedRow = row;
    this.jiraSettingForm.setValue( {
      id: row.id,
      base_url: row.base_url.toString(),
      user_name: row.user_name.toString(),
      api_token: row.api_token.toString(),
    })

  }

  public onSubmit(): void {
    const jiraSetting = this.jiraSettingForm.value;
    if (this.selectedRow === null || jiraSetting === null || jiraSetting.base_url === null || jiraSetting.user_name === null || jiraSetting.api_token === null 
      || jiraSetting.base_url === undefined || jiraSetting.user_name === undefined || jiraSetting.api_token === undefined
    ) {
      return;
    }
    this.selectedRow.base_url = jiraSetting.base_url;
    this.selectedRow.user_name = jiraSetting.user_name;
    this.selectedRow.api_token = jiraSetting.api_token;
    invoke<string>("update_jira_settings", {settings: this.jiraSettings}).then((text) => {
      this.jiraSettings = JSON.parse(text);
    });
  }

  public createNewJiraSetting(event: { preventDefault: () => void; }): void {
    event.preventDefault();

    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    invoke<string>("create_connect_setting").then((text) => {
      console.log(text);
      this.jiraSettings = JSON.parse(text);
    });
  }

}
