
import Controller from './utils/controller';

class Page extends Controller {

  constructor() {
    super();
    this.init();
    this.bindEvent();
    Controller.isLogin(() => {
      this.rCart();
    });
  }

  init() {
    // 分类数据
    this.arrSort = {
      // 11: {name: '优惠'},
      // 12: {name: '招牌'},
    };

    // 商品数据
    this.arrItem = {
      // // key为分类ID
      // 11: [
      //   {
      //     itemId: 13,
      //     name: '精品生日水果蛋糕13',
      //     num: 0,
      //     imgUrl: '/src/images/item.png',
      //     text: '送蜡烛10支，每个账号限买一个',
      //     price: '100.00',
      //     isSpec: 1,
      //     groupId: '', // 只存放在this.curSpec中
      //     selectSpec: [
      //       {id: '12,14', price: '123', num: 2, specTxt: '12寸/咸味'},
      //       {id: '11,14', price: '120', num: 1, specTxt: '13寸/甜味'},
      //     ],
      //     spec: [{
      //       "spec_group_id": 11,
      //       "spec_group_name": "尺寸",
      //       "spec_group_beizhu": "蛋糕尺寸",
      //       "spec_group_list": [
      //         {"spec_id": "13", "spec_name": "8寸"},
      //         {"spec_id": "12", "spec_name": "6寸"},
      //         {"spec_id": "14", "spec_name": "10寸"},
      //         {"spec_id": "15", "spec_name": "12寸"}
      //       ]
      //     }],
      //     group: {
      //       '13': {"skuid": 1, "price": 112},
      //       '12': {"skuid": 1, "price": 113},
      //       '14,16': {"skuid": 1, "price": 116},
      //     },
      //   }
      // ],
    };

    // 购物车数据
    this.arrCart = {};

    // 当前规格商品
    this.curSpec = null;

    // 初始化数据
    this.arrSort = JSON.parse(sessionStorage.arrSort || '{}');
    this.arrItem = JSON.parse(sessionStorage.arrItem || '{}');
    this.arrCart = JSON.parse(sessionStorage.arrCart || '{}');
    // 为空去获取数据，有数据则直接渲染
    if ($.isEmptyObject(this.arrSort) || $.isEmptyObject(this.arrItem)) {
      this.rItems();
    } else {
      this.renderSort();
      this.renderItem();
    }
    this.renderCart();
  }

  bindEvent() {
    const _this = this;
    const cartMask = $("#cartMask");
    const cartOutBox = $("#cartOutBox");

    // 查看购物车
    $("#viewCart").click(() => {
      cartMask.show();
      cartOutBox.css("bottom", 45);
    });

    // 点击空白隐藏购物车
    cartMask.click(() => {
      cartMask.hide();
      cartOutBox.css("bottom", '-100%');
    });

    // 选择分类滚动到对应商品
    $("#iScrollSort").on('click', 'li', function(){
      const sid = $(this).data("sortid");
      $(this).addClass('cur').siblings('li').removeClass();
      _this.iScrollItem.scrollToElement("#itemarr_"+ sid, 500);
    });

    // 加减商品列表中商品
    $("#iScrollItem").on('click', ".J_item_choice i", function(){
      const isAdd = $(this).hasClass("icon-add");
      const curLi = $(this).closest('li');
      _this.changeCart(curLi.data('sortid'), curLi.data('itemid'), isAdd);
    });

    // 打开选规格
    $("#iScrollItem").on('click', ".J_item_choice span", function(){
      const curLi = $(this).closest('li');
      _this.openSpec(curLi.data('sortid'), curLi.data('itemid'));
    });

    // 选择规格
    $("#specBox").on('click', "span", function(){
      if ($(this).hasClass("cur")) return;
      $(this).addClass('cur').siblings('span').removeClass();
      _this.curChoiseSpec();
    });

    // 确认选择规格
    $("#choiceSpecOK").click(() => this.choiceSpecSave());

    // 修改购物车数量
    $("#cartItemBox").on('click', '.J_cart_choice i', function(){
      const isAdd = $(this).hasClass("icon-add");
      const curLi = $(this).closest('li');
      _this.updateCart(curLi.data('sortid'), curLi.data('itemid'), curLi.data('specid'), isAdd, $(this).siblings('strong'));
    });

    // 清空购物车
    $("#cleanCart").click(() => this.cleanCart());

    // 去结算
    $("#settlement").click(() => this.settlement());

  }

  // 获取商品数据
  rItems() {
    Controller.ajax({
      url: '/index/goods',
      type: 'GET',
    }, (res) => {
      const listArr = res.data && res.data.goods || [];
      this.formatItems(listArr);
    });
  }

  // 格式化数据
  formatItems(listArr) {
    for (let i in listArr) {
      const items = listArr[i].items || [];
      if (items.length == 0) continue;
      this.arrSort[listArr[i].category_id] = {name: listArr[i].category_name};
      let arrItem = [];
      for (let j in items) {
        let itemsList = items[j];
        let group = {};
        for (let k in itemsList.goods_skuid) {
          let sku = itemsList.goods_skuid[k];
          group[sku.spec_ids] = {skuid: sku.skuid, price: sku.goods_price};
        }
        arrItem.push({
          itemId: itemsList.id,
          name: itemsList.goods_name,
          num: 0,
          imgUrl: itemsList.goods_logo || '/src/images/item.png',
          text: itemsList.goods_desc || '送蜡烛10支，每个账号限买一个',
          price: itemsList.goods_price,
          isSpec: itemsList.is_spec,
          spec: itemsList.spec_group_info,
          selectSpec: [],
          group: group
        });
      }
      this.arrItem[listArr[i].category_id] = arrItem;
    }
    this.saveSession();
    this.renderSort();
    this.renderItem();
  }

  // 渲染分类
  renderSort() {
    let itemHTML = '';
    for (let i in this.arrSort) {
      let item = this.arrSort[i];
      itemHTML += `<li data-sortid="${i}" id="sort_${i}"${i == 0 ? ' class="cur"' : ''}><p>${item.name}</p></li>`;
    }
    $("#sortBox").html(itemHTML);
    setTimeout(() => {
      this.iScrollMenu = new IScroll('#iScrollSort', { disableMouse: true, click: true, tap: true });
    }, 200);
  }

  // 渲染商品
  renderItem() {
    let itemHTML = '';
    for (let i in this.arrItem) {
      const arrItem = this.arrItem[i] || [];
      if (arrItem.length == 0) continue;
      // 点击左侧分类定位用
      itemHTML += `<ul id="itemarr_${i}">`;
      for (let j in arrItem) {
        let item = arrItem[j];
        // 格式化价格
        let price = Controller.formatMoney(item.price);
        let priceHtml = `<i>￥</i>${price}`;
        if (item.isSpec == 1) priceHtml += '<i>起</i>';
        // 是否需要选规格
        let choiceHtml = `<i class="iconfont icon-minus"></i><strong>${item.num}</strong><i class="iconfont icon-add"></i>`;
        if (item.isSpec == 1) choiceHtml = '<span>选规格</span>';
        itemHTML += `<li id="item_${item.itemId}" data-sortid="${i}" data-itemid="${item.itemId}">
          <p class="item_img_box"><a href="detail.html"><img src="${item.imgUrl}" /></a></p>
          <div class="item_infor_box">
            <p class="item_name">${item.name}</p>
            <div class="item_remark">${item.text}</div>
            <div class="price_box">
              <p class="item_choice J_item_choice">${choiceHtml}</p>
              <p class="item_price">${priceHtml}</p>
            </div>
          </div>
        </li>`;
      }
      itemHTML += '</ul>';
    }
    $("#itemBox").html(itemHTML);
    setTimeout(() => {
      this.iScrollItem = new IScroll('#iScrollItem', { disableMouse: true, click: true, tap: true });
    }, 200);
  }

  // 获取购物车数据
  rCart() {
    Controller.ajax({
      url: '/cart/list',
      type: 'POST',
      data: {
        token: window.Token,
        shopid: '',
        is_check: '',
      },
    }, (res) => {
      // this.renderCart();
    });
  }

  // 渲染购物车
  renderCart() {
    let itemHTML = '';
    let totalNum = 0;
    let totalPrice = 0;
    for (let i in this.arrCart) {
      let item = this.arrCart[i];
      if (!item) continue;
      if (item.isSpec == 1) {
        for (let j in item.selectSpec) {
          let select = item.selectSpec[j];
          if (select.num > 0) {
            item.price = select.price || '0';
            item.num = select.num;
            item.specId = select.id || 'aaa';
            totalNum += parseInt(select.num);
            totalPrice += parseInt(select.price) * parseInt(select.num);
            itemHTML += this.cartHtml(item);
          }
        }
      }
      if (item.isSpec != 1 && item.num > 0) {
        totalNum += parseInt(item.num);
        totalPrice += parseInt(item.price) * parseInt(item.num);
        itemHTML += this.cartHtml(item);
      }
    }
    if (itemHTML == '') itemHTML = '<li>无商品！</li>';
    $("#cartItemBox").html(itemHTML);
    totalPrice = Controller.formatMoney(totalPrice);
    $("#viewCart").html(`<i class="iconfont icon-gouwuche"><b>${totalNum}</b></i>￥<span>${totalPrice}</span>`);
  }

  // 购物车HTML
  cartHtml(item) {
    let price = Controller.formatMoney(item.price);
    return `<li data-sortid="${item.sortId}" data-itemid="${item.itemId}" data-specid="${item.isSpec == 1 ? item.specId : '0'}">
      <div class="cart_item">
        <p class="cart_item_tit">${item.name}</p>
        <p class="cart_item_sm">${price}</p>
      </div>
      <div class="cart_choice J_cart_choice">
        <i class="iconfont icon-minus"></i>
        <strong>${item.num}</strong>
        <i class="iconfont icon-add"></i>
      </div>
    </li>`;
  }

  // 加入/移出购物车
  changeCart(aid, cid, isadd) {
    const arrItem = this.arrItem[aid];
    let curNum = 0;
    let arrItemIndex = 0;
    for (let i in arrItem) {
      if (arrItem[i].itemId == cid) {
        curNum = parseInt(arrItem[i].num);
        arrItemIndex = i;
        break;
      }
    }
    let resNum = isadd ? ++curNum : --curNum;
    if (resNum < 0 || resNum > 99) return;
    this.arrItem[aid][arrItemIndex].num = resNum;
    // 更新加入购物车
    let arrCart = this.arrCart;
    if (resNum > 0) {
      arrCart[cid] = this.arrItem[aid][arrItemIndex];
      arrCart[cid].sortId = aid;
    } else {
      arrCart[cid] = null;
    }
    this.saveSession();
    $("#item_"+ cid).find("strong").text(resNum);
    this.renderCart();
  }

  // 打开选规格
  openSpec(sortid, itemid) {
    const arrItem = this.arrItem[sortid];
    for (let i in arrItem) {
      if (arrItem[i].itemId == itemid) this.curSpec = arrItem[i];
    }
    this.curSpec['sortId'] = sortid;
    let specHTML = '';
    for (let i in this.curSpec.spec) {
      let spec = this.curSpec.spec[i];
      specHTML += `<p>${spec.spec_group_name}</p>`;
      specHTML += '<p>';
      for (let j in spec.spec_group_list) {
        let specSku = spec.spec_group_list[j];
        // specHTML += `<span data-specid="${arrSpec[i].id}" data-specprice="${arrSpec[i].price}">${arrSpec[i].name}</span>`;
        specHTML += `<span data-specid="${specSku.spec_id}"${j == 0 ? ' class="cur"' : ''}>${specSku.spec_name}</span>`;
      }
      specHTML += '</p>';
    }
    $("#specTit").text(this.curSpec.name);
    $("#specBox").html(specHTML);
    this.curChoiseSpec();
    $("#choiceSpec").show();
  }

  // 选择规格更新curSpec和价格
  curChoiseSpec() {
    let specIds = [];
    $("#specBox span.cur").map(function() {
      let specid = $(this).data('specid');
      specIds.push(specid);
    });
    // 获取组合价格
    let groupId = specIds.join(',');
    this.curSpec['groupId'] = groupId;
    let group = this.curSpec.group[groupId];
    let groupPrice = '售罄';
    if (group) groupPrice = Controller.formatMoney(group.price);
    $("#choiceSpecPrice").html(`<i>￥</i>${groupPrice}`);
  }

  // 确认规格
  choiceSpecSave() {
    const curSpec = this.curSpec;
    // 更新当前规格商品信息
    let selectIndex = -1;
    for (let i in curSpec.selectSpec) {
      if (curSpec.selectSpec[i].id == curSpec.groupId) selectIndex = i;
    }
    let groupInfo = curSpec.group[curSpec.groupId];
    if (selectIndex == -1) {
      this.curSpec.selectSpec.push({id: curSpec.groupId, price: groupInfo.price || '0', num: 1, specTxt: groupInfo.name || '未命名'});
    } else {
      this.curSpec.selectSpec[selectIndex].num++;
    }
    // 更新购物车和商品列表信息
    const arrItem = this.arrItem[curSpec.sortId];
    for (let i in arrItem) {
      if (arrItem[i].itemId == curSpec.itemId) this.arrItem[curSpec.sortId][i] = this.curSpec;
    }
    this.arrCart[curSpec.itemId] = this.curSpec;
    this.saveSession();
    $("#choiceSpec").hide();
    this.renderCart();
  }

  // 修改购物车
  updateCart(aid, cid, sid, isadd, cartdom) {
    let curNum = parseInt(cartdom.text());
    let resNum = isadd ? ++curNum : --curNum;
    // let isDel = confirm('是否从购物车中删除？');
    // if (!isDel) return;
    let itemIndex = -1, specIndex = -1;
    for (let i in this.arrItem[aid]) {
      let itemList = this.arrItem[aid][i];
      if (itemList.itemId == cid) itemIndex = i;
      // 查找规格商品
      if (itemList.itemId == cid && itemList.isSpec == 1) {
        for (let j in itemList.selectSpec) {
          if (itemList.selectSpec[j].id == sid) specIndex = j;
        }
      }
    }
    if (specIndex > -1) this.arrItem[aid][itemIndex].selectSpec[specIndex].num = resNum;
    this.arrCart[cid].num = this.arrItem[aid][itemIndex].num = resNum;
    $("#item_"+ cid).find("strong").text(resNum);
    // cartdom.text(resNum);
    this.saveSession();
    this.renderCart();
  }

  // 清空购物车
  cleanCart() {
    let isDel = confirm('是否清空购物车？');
    if (!isDel) return;
    for (let i in this.arrCart) {
      for (let j in this.arrItem[i]) {
        let item = this.arrItem[i][j];
        if (item.isSpec == 1) item.selectSpec = [];
        item.num = 0;
      }
    }
    this.arrCart = {};
    this.saveSession();
    window.location.reload();
    // 登录状态更新服务端数据
    // if (!this.token) return;
    // Controller.ajax({
    //   url: '/cart/clearall',
    //   type: 'POST',
    //   data: {token: this.token, shopid: ''},
    // }, (res) => {
    //   console.log(res);
    // });
  }

  // 去结算
  settlement() {
    let arrItem = [];
    for (let i in this.arrCart) {
      let item = this.arrCart[i];
      if (item.isSpec == 1) {
        for (let j in item.selectSpec) {
          let spec = item.selectSpec[j];
          if (spec.num > 0) arrItem.push({goods_id: i, spec_ids: spec.id, cart_num: spec.num});
        }
      }
      if (item.isSpec != 1 && item.num > 0) {
        arrItem.push({goods_id: i, spec_ids: 0, cart_num: item.num});
      }
    }
    if (arrItem.length == 0) {
      Controller.showMessage("购物车中还没有商品！");
      return;
    }
    if (window.Token == '') window.location.href = './login.html';
    let param = {
      token: window.Token,
      goods_info_type: 2, // 1常规字符串，2json格式字符串
      goods_info: JSON.stringify(arrItem),
      is_allow_fail: '', // 是否允许部分失败 0允许(默认)，1不允许
    }
    Controller.ajax({
      url: '/cart/batchadd',
      type: 'POST',
      data: param,
      dataType: "json",
    }, (res) => {
      // this.arrItem = {};
      // this.arrCart = {};
      // this.saveSession();
      window.location.href = './confirm.html';
    });
  }

  // 暂存数据
  saveSession() {
    sessionStorage.arrSort = JSON.stringify(this.arrSort);
    sessionStorage.arrItem = JSON.stringify(this.arrItem);
    sessionStorage.arrCart = JSON.stringify(this.arrCart);
  }

}

new Page();
