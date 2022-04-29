import { Component, OnInit, NgZone } from "@angular/core";
import { PouchDBService } from "../../services/pouchdb.service";
import { ConfigData } from "../../config";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  productTypesObj: any;
  syncUrl: any;
  dbName: any;
  bucketData: any;
  productsType: any = [];
  pubChangedProductsType: any = {};
  unpubChangedProductsType: any = [];
  products: any = [];

  constructor(
    private database: PouchDBService,
    private zone: NgZone,
    private config: ConfigData
  ) {
    this.bucketData = [];
    this.syncUrl = this.config.SYNC_URL;
    this.dbName = this.config.DB_NAME;
    this.productTypesObj = {
      name: "",
      is_published: 1,
      is_product: false
    };
  }

  ngOnInit() {
    this.database.sync(this.syncUrl + "/" + this.dbName);
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
            const _in = this.bucketData.findIndex(item => item.id == _data.id);
            if (_in == null || _in == undefined || _in == -1) {
              this.bucketData.unshift(Object.assign({}, _data));
              this.dataManager();
            } else {
              this.bucketData.splice(_in, 1);
              this.bucketData.unshift(Object.assign({}, _data));
              this.dataManager();
            }
          }
        }
      });
    });

    this.database.fetch().then(
      result => {
        this.bucketData = [];
        result.rows = result.rows.filter(function (obj) {
          return obj.doc.hasOwnProperty("is_product");
        });
        this.bucketData = result.rows;
        this.dataManager();
      },
      error => {
        console.error(error);
      }
    );
  }

  dataManager() {
    this.productsType = [];
    this.products = [];
    for (let i = 0; i < this.bucketData.length; i++) {
      const _data = this.bucketData[i];
      if (_data.doc.hasOwnProperty("is_product")) {
        if (_data.doc.is_product) {
          this.products.push(_data.doc);
        } else {
          this.productsType.push(_data.doc);
        }
      }
    }
  }

  addProductType(_element: any) {
    let _type_name = _element.value;
    if (_type_name != "" && _type_name != undefined && _type_name != null) {
      this.productTypesObj.name = _type_name;
      this.insertData(
        this.productTypesObj.name + "" + this.makeId(),
        this.productTypesObj,
        _doc => {
          _type_name = "";
          _element.value = "";
        }
      );
    } else {
      alert("Please enter product type.");
    }
  }

  checkChange(e: any, _type_obj: any, _type: string) {
    _type_obj = Object.assign({}, _type_obj);
    if (_type == "pub") {
      if (e.target.checked) {
        _type_obj["is_published"] = "0";
        this.pubChangedProductsType[_type_obj._id] = _type_obj;
      } else {
        delete this.pubChangedProductsType[_type_obj._id];
      }
    } else {
      if (e.target.checked) {
        _type_obj["is_published"] = "1";
        this.unpubChangedProductsType[_type_obj._id] = _type_obj;
      } else {
        delete this.unpubChangedProductsType[_type_obj._id];
      }
    }
  }

  unPublish() {
    Object.keys(this.pubChangedProductsType).forEach(key => {
      delete this.pubChangedProductsType[key]["_id"];
      delete this.pubChangedProductsType[key]["_rev"];
      this.insertData(key, this.pubChangedProductsType[key], _doc => { });
      delete this.pubChangedProductsType[key];
    });
  }

  publish() {
    Object.keys(this.unpubChangedProductsType).forEach(key => {
      delete this.unpubChangedProductsType[key]["_id"];
      delete this.unpubChangedProductsType[key]["_rev"];
      this.insertData(key, this.unpubChangedProductsType[key], _doc => { });
      delete this.unpubChangedProductsType[key];
    });
  }

  insertData(_key: string, _val: string, _callback: any) {
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
