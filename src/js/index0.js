
import Controller from './utils/controller';

class Page extends Controller {

  constructor() {
    super();
    this.init();
    this.bindEvent();
  }

  init() {
    this.token = Controller.getCookie('token');

    // 分类数据
    this.arrSort = {
      11: {name: '优惠'},
      12: {name: '招牌'},
      13: {name: '吃货最爱'},
      14: {name: '卡通生日蛋糕'},
      21: {name: '优惠'},
      22: {name: '招牌'},
      23: {name: '吃货最爱'},
      24: {name: '卡通生日蛋糕'},
      31: {name: '优惠'},
      32: {name: '招牌'},
      33: {name: '吃货最爱'},
      34: {name: '卡通生日蛋糕'},
    };

    // 商品数据
    this.arrItem = {
      11: [
        {
          itemId: 12,
          name: '精品生日水果蛋糕12',
          num: 0,
          imgUrl: '/src/images/item.png',
          text: '送蜡烛10支，每个账号限买一个',
          price: '100.00',
          isSpec: 0,
          spec: [],
        },
        {
          itemId: 13,
          name: '精品生日水果蛋糕13',
          num: 0,
          imgUrl: '/src/images/item.png',
          text: '送蜡烛10支，每个账号限买一个',
          price: '100.00',
          isSpec: 1,
          spec: [
            {
              id: 101,
              specName: "规格",
              specItems: [
                {id: 10011, name: "3寸", price: 110},
                {id: 10012, name: "5寸", price: 150},
                {id: 10013, name: "9寸", price: 180},
              ],
            },
          ],
        },
      ],
      21: [
        {
          itemId: 22,
          name: '精品生日水果蛋糕22',
          num: 0,
          imgUrl: '/src/images/item.png',
          text: '送蜡烛10支，每个账号限买一个',
          price: '100.00',
          isSpec: 0,
          spec: [],
        },
        {
          itemId: 23,
          name: '精品生日水果蛋糕23',
          num: 0,
          imgUrl: '/src/images/item.png',
          text: '送蜡烛10支，每个账号限买一个',
          price: '100.00',
          isSpec: 0,
          spec: [],
        },
      ],
      31: [
        {
          itemId: 32,
          name: '精品生日水果蛋糕32',
          num: 0,
          imgUrl: '/src/images/item.png',
          text: '送蜡烛10支，每个账号限买一个',
          price: '100.00',
          isSpec: 0,
          spec: [],
        },
        {
          itemId: 33,
          name: '精品生日水果蛋糕33',
          num: 0,
          imgUrl: '/src/images/item.png',
          text: '送蜡烛10支，每个账号限买一个',
          price: '100.00',
          isSpec: 1,
          spec: [
            {
              id: 100,
              specName: "规格",
              specItems: [
                {id: 10001, name: "6寸", price: 110},
                {id: 10002, name: "8寸", price: 150},
                {id: 10003, name: "12寸", price: 180},
              ],
            },
          ],
        },
      ],
    };

    // 购物车数据
    this.arrCart = {
      11: null,
      12: null,
      13: null,
    };

    this.rItems();
    this.rCart();
  }

  bindEvent() {
    const _this = this;

    $("#viewCart").click(function(){
      _this.renderCart();
      $("#cartMask").show();
      $("#cartOutBox").css("bottom", 45);
    });

    // 点击空白隐藏购物车
    $("#cartMask").click(function(e){
      $(this).hide();
      $("#cartOutBox").css("bottom", '-80%');
    });

    // 滚动
    $("#iScrollSort").on('click', 'li', function(){
      const sid = $(this).data("sortid");
      _this.iScrollItem.scrollToElement("#itemarr_"+ sid, 500);
    });

    // 加减商品
    $("#iScrollItem").on('click', ".J_item_choice i", function(){
      const isAdd = $(this).hasClass("icon-add");
      const itemId = $(this).closest('li').data('itemid');
      _this.cartAdd(isAdd, itemId);
    });

    // 选规格
    $("#iScrollItem").on('click', ".J_item_choice span", function(){
      const curLi = $(this).closest('li');
      _this.choiceSpec(curLi.data('sortid'), curLi.data('itemid'));
    });

    // 修改购物车数量
    $("#cartItemBox").on('click', '.J_cart_choice i', function(){
      const isAdd = $(this).hasClass("icon-add");
      const curLi = $(this).closest('li');
      _this.updateCart(curLi.data('sortid'), curLi.data('itemid'), isAdd);
    });

    // 清空购物车
    $("#cleanCart").click(() => this.cleanCart());

  }

  // 获取商品数据
  rItems() {
    Controller.ajax({
      url: '/index/goods',
      type: 'POST',
    }, (res) => {
      const listArr = res.data.goods || [];
      this.formatItems(listArr);
    });
  }

  // 获取购物车数据
  rCart() {
    let param = {
      token: this.token,
      shopid: '',
      is_check: '',
    };
    Controller.ajax({
      url: '/cart/list',
      type: 'POST',
      data: param,
    }, (res) => {
      this.renderCart();
    });
  }

  // 加入购物车
  cartAdd(isadd, itemid) {
    let itemDom = $("#item_"+ itemid).find("strong");
    let curNum = parseInt(itemDom.text());
    let relNum = isadd ? ++curNum : --curNum;
    let param = {
      token: this.token,
      goods_id: itemid,
      spec_ids: '',
      cart_num: relNum
    };
    Controller.ajax({
      url: '/cart/add',
      type: 'POST',
      data: param,
    }, (res) => {
      itemDom.text(relNum);
      this.rCart();
    });
  }

  // 格式化数据
  formatItems(listArr) {
    for (let i in listArr) {
      const items = listArr[i].items || [];
      if (items.length == 0) continue;
      this.arrSort[listArr[i].category_id] = {name: listArr[i].category_name};
      let arrItem = [];
      let arrSpec = [];
      for (let j in items) {
        let itemsList = items[j];
        if (itemsList.is_spec == 1) {
          for (let k in itemsList.goods_spec_data) {
            let specData = itemsList.goods_spec_data[k];
            let specItems = [];
            for (let l in specData.spec_group_items) {
              let sItem = specData.spec_group_items[l];
              specItems.push({id: sItem.spec_id, name: sItem.spec_name, price: sItem.goods_price})
            }
            arrSpec.push({ id: specData.spec_group_id, specName: specData.spec_group_name, specItems: specItems})
          }
        }
        arrItem.push({
          itemId: itemsList.id,
          name: itemsList.goods_name,
          num: itemsList.goods_num,
          imgUrl: '/src/images/item.png', // itemsList.goods_logo
          text: '送蜡烛10支，每个账号限买一个', // itemsList.goods_desc
          price: itemsList.goods_price,
          isSpec: itemsList.is_spec,
          spec: arrSpec,
        });
      }
      this.arrItem[listArr[i].category_id] = arrItem;
    }
    this.renderSort();
    this.renderItem();
    setTimeout(() => {
      this.iScrollMenu = new IScroll('#iScrollSort', { disableMouse: true, click: true, tap: true });
      this.iScrollItem = new IScroll('#iScrollItem', { disableMouse: true, click: true, tap: true });
    }, 200);
  }

  // 渲染分类
  renderSort() {
    let itemHTML = '';
    for (let i in this.arrSort) {
      let item = this.arrSort[i];
      itemHTML += `<li data-sortid="${i}" id="sort_${i}"><p>${item.name}</p></li>`;
    }
    $("#sortBox").html(itemHTML);
  }

  // 渲染商品
  renderItem() {
    let itemHTML = '';
    for (let i in this.arrItem) {
      const arrItem = this.arrItem[i] || [];
      if (arrItem.length == 0) continue;
      itemHTML += `<ul id="itemarr_${i}" data-itemarrid="${i}">`;
      for (let j in arrItem) {
        let item = arrItem[j];
        // 格式价格
        let priceHtml = `<i>￥</i>${item.price}`;
        if (item.isSpec == 1) priceHtml += '<i>起</i>';
        // 是否需要选规格
        let choiceHtml = `<i class="iconfont icon-minus"></i><strong>${item.num}</strong><i class="iconfont icon-add"></i>`;
        if (item.isSpec == 1) choiceHtml = '<span>选规格</span>';
        itemHTML += `<li id="item_${item.itemId}" data-sortid="${i}" data-itemid="${item.itemId}">
          <p class="item_img_box">
            <a href="detail.html"><img src="${item.imgUrl}" /></a>
          </p>
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
  }

  // 渲染购物车
  renderCart() {
    let itemHTML = '';
    for (let i in this.arrCart) {
      let item = this.arrCart[i];
      if (!item) continue;
      itemHTML += `<li data-sortid="${item.sortId}" id="cart_${i}" data-itemid="${i}">
        <div class="cart_item">
            <p class="cart_item_tit">${item.name}</p>
            <p class="cart_item_sm">${item.price}</p>
        </div>
        <div class="cart_choice J_cart_choice">
          <i class="iconfont icon-minus"></i>
          <strong>${item.num}</strong>
          <i class="iconfont icon-add"></i>
        </div>
      </li>`;
    }
    if (itemHTML == '') itemHTML = '<li>空空如也！</li>';
    $("#cartItemBox").html(itemHTML);
  }


  // 选规格
  choiceSpec(aid, cid) {
    console.log(aid, cid);
    $("#choiceSize").show();
  }

  // 修改购物车
  updateCart(aid, cid, isadd) {
    let curNum = parseInt(this.arrCart[cid].num);
    let resNum = isadd ? ++curNum : --curNum;
    for (let i in this.arrItem[aid]) {
      let itemList = this.arrItem[aid][i];
      if (itemList.itemId == cid) {
        this.arrCart[cid].num = this.arrItem[aid][i].num = resNum;
        break;
      }
    }
    $("#cart_"+ cid +", #item_"+ cid).find("strong").text(resNum);
  }

  // 清空购物车
  cleanCart() {
    let param = {
      token: this.token,
      shopid: '',
    };
    Controller.ajax({
      url: '/cart/clearall',
      type: 'POST',
      data: param,
    }, (res) => {
      // const listArr = res.data.goods || [];
      // this.formatItems(listArr);
    });
  }


}

new Page();