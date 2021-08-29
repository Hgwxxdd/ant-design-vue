import PropTypes from '../_util/vue-types';
import KEYCODE from './KeyCode';
import BaseMixin from '../_util/BaseMixin';
import { withDirectives } from 'vue';
import antInput from '../_util/antInputDirective';

export default {
  mixins: [BaseMixin],
  props: {
    disabled: PropTypes.looseBool,
    changeSize: PropTypes.func,
    quickGo: PropTypes.func,
    selectComponentClass: PropTypes.any,
    current: PropTypes.number,
    pageSizeOptions: PropTypes.array.def(['10', '20', '50', '100']),
    pageSize: PropTypes.number,
    buildOptionText: PropTypes.func,
    locale: PropTypes.object,
    rootPrefixCls: PropTypes.string,
    selectPrefixCls: PropTypes.string,
    goButton: PropTypes.any,
  },
  data() {
    return {
      goInputText: '',
    };
  },
  methods: {
    getValidValue() {
      const { goInputText } = this;
      return !goInputText || isNaN(goInputText) ? undefined : Number(goInputText);
    },
    defaultBuildOptionText(opt) {
      return `${opt.value} ${this.locale.items_per_page}`;
    },
    handleChange(e) {
      const { value, composing } = e.target;
      if (e.isComposing || composing || this.goInputText === value) return;
      this.setState({
        goInputText: value,
      });
    },
    handleBlur(e) {
      const { goButton, quickGo, rootPrefixCls } = this.$props;

      const { goInputText } = this.$data;
      if (goButton || goInputText === '') {
        return;
      }
      this.setState({
        goInputText: '',
      });
      if (
        e.relatedTarget &&
        (e.relatedTarget.className.indexOf(`${rootPrefixCls}-item-link`) >= 0 ||
          e.relatedTarget.className.indexOf(`${rootPrefixCls}-item`) >= 0)
      ) {
        return;
      }
      quickGo(this.getValidValue());
    },
    go(e) {
      const { goInputText } = this;
      if (goInputText === '') {
        return;
      }
      if (e.keyCode === KEYCODE.ENTER || e.type === 'click') {
        // https://github.com/vueComponent/ant-design-vue/issues/1316
        this.quickGo(this.getValidValue());
        this.setState({
          goInputText: '',
        });
      }
    },
    getPageSizeOptions() {
      const { pageSize, pageSizeOptions } = this.$props;
      if (pageSizeOptions.some(option => option.toString() === pageSize.toString())) {
        return pageSizeOptions;
      }
      return pageSizeOptions.concat([pageSize.toString()]).sort((a, b) => {
        // eslint-disable-next-line no-restricted-globals
        const numberA = isNaN(Number(a)) ? 0 : Number(a);
        // eslint-disable-next-line no-restricted-globals
        const numberB = isNaN(Number(b)) ? 0 : Number(b);
        return numberA - numberB;
      });
    },
  },
  render() {
    const {
      rootPrefixCls,
      locale,
      changeSize,
      quickGo,
      goButton,
      selectComponentClass: Select,
      defaultBuildOptionText,
      selectPrefixCls,
      pageSize,
      goInputText,
      disabled,
    } = this;
    const prefixCls = `${rootPrefixCls}-options`;
    let changeSelect = null;
    let goInput = null;
    let gotoButton = null;

    if (!changeSize && !quickGo) {
      return null;
    }

    const pageSizeOptions = this.getPageSizeOptions();

    if (changeSize && Select) {
      const buildOptionText = this.buildOptionText || defaultBuildOptionText;
      const options = pageSizeOptions.map((opt, i) => (
        <Select.Option key={i} value={opt}>
          {buildOptionText({ value: opt })}
        </Select.Option>
      ));

      changeSelect = (
        <Select
          disabled={disabled}
          prefixCls={selectPrefixCls}
          showSearch={false}
          class={`${prefixCls}-size-changer`}
          optionLabelProp="children"
          value={(pageSize || pageSizeOptions[0]).toString()}
          onChange={value => this.changeSize(Number(value))}
          getPopupContainer={triggerNode => triggerNode.parentNode}
        >
          {options}
        </Select>
      );
    }

    if (quickGo) {
      if (goButton) {
        gotoButton =
          typeof goButton === 'boolean' ? (
            <button
              type="button"
              onClick={this.go}
              onKeyup={this.go}
              disabled={disabled}
              class={`${prefixCls}-quick-jumper-button`}
            >
              {locale.jump_to_confirm}
            </button>
          ) : (
            <span onClick={this.go} onKeyup={this.go}>
              {goButton}
            </span>
          );
      }
      goInput = (
        <div class={`${prefixCls}-quick-jumper`}>
          {locale.jump_to}
          {withDirectives(
            <input
              disabled={disabled}
              type="text"
              value={goInputText}
              onInput={this.handleChange}
              onChange={this.handleChange}
              onKeyup={this.go}
              onBlur={this.handleBlur}
            />,
            [[antInput]],
          )}
          {locale.page}
          {gotoButton}
        </div>
      );
    }

    return (
      <li class={`${prefixCls}`}>
        {changeSelect}
        {goInput}
      </li>
    );
  },
};
