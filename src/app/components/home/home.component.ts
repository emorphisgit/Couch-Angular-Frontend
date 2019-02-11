import { Component, OnInit, NgZone } from "@angular/core";
import { PouchDBService } from "../../services/pouchdb.service";
import { ConfigData } from "../../config";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  product_types_obj: any;
  sync_url: any;
  db_name: any;
  bucket_data: any;
  products_type: any = [];
  pub_changed_products_type: any = {};
  unpub_changed_products_type: any = [];
  products: any = [];

  constructor(
    private database: PouchDBService,
    private zone: NgZone,
    private config: ConfigData
  ) {
    this.bucket_data = [];
    this.sync_url = this.config.sync_url;
    this.db_name = this.config.db_name;
    this.product_types_obj = {
      name: "",
      is_published: 1,
      is_product: false
    };
  }

  ngOnInit() {
    this.database.sync(this.sync_url + "/" + this.db_name);
    this.database.getChangeListener().subscribe(data => {
      this.zone.run(() => {
        for (let i = 0; i < data.change.docs.length; i++) {
          const _data = {
            doc: data.change.docs[i],
            id: data.change.docs[i]._id,
            key: data.change.docs[i]._id,
            value: {
              rev: data.change.docs[i]._rev
            }
          };
          if (_data.doc.hasOwnProperty("is_product")) {
            const _in = this.bucket_data.findIndex(item => item.id == _data.id);
            if (_in == null || _in == undefined || _in == -1) {
              this.bucket_data.unshift(Object.assign({}, _data));
              this.dataManager();
            } else {
              this.bucket_data.splice(_in, 1);
              this.bucket_data.unshift(Object.assign({}, _data));
              this.dataManager();
            }
          }
        }
      });
    });

    this.database.fetch().then(
      result => {
        this.bucket_data = [];
        result.rows = result.rows.filter(function(obj) {
          return obj.doc.hasOwnProperty("is_product");
        });
        this.bucket_data = result.rows;
        this.dataManager();
      },
      error => {
        console.error(error);
      }
    );
  }

  dataManager() {
    this.products_type = [];
    this.products = [];
    for (let i = 0; i < this.bucket_data.length; i++) {
      const _data = this.bucket_data[i];
      if (_data.doc.hasOwnProperty("is_product")) {
        if (_data.doc.is_product) {
          this.products.push(_data.doc);
        } else {
          this.products_type.push(_data.doc);
        }
      }
    }
  }

  addProductType(_element) {
    let _type_name = _element.value;
    if (_type_name != "" && _type_name != undefined && _type_name != null) {
      this.product_types_obj.name = _type_name;
      this.insertData(
        this.product_types_obj.name + "" + this.makeId(),
        this.product_types_obj,
        _doc => {
          _type_name = "";
          _element.value = "";
        }
      );
    } else {
      alert("Please enter product type.");
    }
  }

  checkChange(e, _type_obj, _type) {
    _type_obj = Object.assign({}, _type_obj);
    if (_type == "pub") {
      if (e.target.checked) {
        _type_obj["is_published"] = "0";
        this.pub_changed_products_type[_type_obj._id] = _type_obj;
      } else {
        delete this.pub_changed_products_type[_type_obj._id];
      }
    } else {
      if (e.target.checked) {
        _type_obj["is_published"] = "1";
        this.unpub_changed_products_type[_type_obj._id] = _type_obj;
      } else {
        delete this.unpub_changed_products_type[_type_obj._id];
      }
    }
  }

  unPublish() {
    Object.keys(this.pub_changed_products_type).forEach(key => {
      delete this.pub_changed_products_type[key]["_id"];
      delete this.pub_changed_products_type[key]["_rev"];
      this.insertData(key, this.pub_changed_products_type[key], _doc => {});
      delete this.pub_changed_products_type[key];
    });
  }

  publish() {
    Object.keys(this.unpub_changed_products_type).forEach(key => {
      delete this.unpub_changed_products_type[key]["_id"];
      delete this.unpub_changed_products_type[key]["_rev"];
      this.insertData(key, this.unpub_changed_products_type[key], _doc => {});
      delete this.unpub_changed_products_type[key];
    });
  }

  insertData(_key, _val, _callback) {
    _key = _key.trim();
    _key = _key.replace(/ /g, "");
    this.database.put(_key, _val).then(doc => {
      _callback(doc);
    });
  }

  makeId() {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
