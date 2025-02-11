import $ from 'jquery';
import { ActionDialog } from 'vj/components/dialog';
import Notification from 'vj/components/notification';
import selectUser from 'vj/components/selectUser';
import { NamedPage } from 'vj/misc/Page';
import i18n from 'vj/utils/i18n';
import pjax from 'vj/utils/pjax';
import request from 'vj/utils/request';

const page = new NamedPage('manage_user_priv', () => {
  const setPrivDialog = new ActionDialog({
    $body: $('.dialog__body--set-priv > div'),
  });
  setPrivDialog.clear = function (priv) {
    this.$dom.find('input.priv[type=checkbox]:hidden').each((i, e) => {
      e.checked = priv & e.value;
    });
    return this;
  };

  async function changeUserPriv(uid, priv) {
    try {
      const res = await request.post('', uid !== 'default' ? {
        uid,
        priv,
      } : { priv });
      if (res.url && res.url !== window.location.href) window.location.href = res.url;
      else {
        Notification.success(i18n('Priv has been updated to {0}.', priv));
        pjax.request({ push: false });
      }
    } catch (error) {
      Notification.error(error.message);
    }
  }

  async function handleOpenUserPrivDialog(ev) {
    const uid = ev.target ? $(ev.target).data('uid') : ev._id;
    const priv = ev.target ? $(ev.target).data('priv') : ev.priv;
    await setPrivDialog.clear(priv);
    const action = await setPrivDialog.open();
    if (action !== 'ok') return;
    let userPriv = 0;
    setPrivDialog.$dom.find('input.priv[type=checkbox]').each((i, e) => {
      if (e.checked) userPriv |= e.value;
    });
    changeUserPriv(uid, userPriv);
  }

  async function handleClickSelectUser() {
    const target = await selectUser();
    if (!target) return;
    const user = await request.get(`/user/${target._id}`);
    handleOpenUserPrivDialog(user.udoc);
  }

  $('[name="select_user"]').on('click', () => handleClickSelectUser());
  $('[name="set_priv"]').on('click', (ev) => handleOpenUserPrivDialog(ev));
});

export default page;
