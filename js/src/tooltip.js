/* global Tether */

import Util from './util'


/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-alpha.6): tooltip.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

const Tooltip = (($) => {

  /**
   * Check for Tether dependency
   * Tether - http://tether.io/
   */
  if (typeof Tether === 'undefined') {
    throw new Error('Bootstrap tooltips require Tether (http://tether.io/)')
  }


  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME                = 'tooltip'
  const VERSION             = '4.0.0-alpha.6'
  const DATA_KEY            = 'bs.tooltip'
  const EVENT_KEY           = `.${DATA_KEY}`
  const JQUERY_NO_CONFLICT  = $.fn[NAME]
  const TRANSITION_DURATION = 150
  const CLASS_PREFIX        = 'bs-tether'

  const Default = {
    animation   : true,
    template    : '<div class="tooltip" role="tooltip">'
                + '<div class="tooltip-inner"></div></div>',
    trigger     : 'hover focus',
    title       : '',
    delay       : 0,
    html        : false,
    selector    : false,
    placement   : 'top',
    offset      : '0 0',
    constraints : [],
    container   : false
  }

  const DefaultType = {
    animation   : 'boolean',
    template    : 'string',
    title       : '(string|element|function)',
    trigger     : 'string',
    delay       : '(number|object)',
    html        : 'boolean',
    selector    : '(string|boolean)',
    placement   : '(string|function)',
    offset      : 'string',
    constraints : 'array',
    container   : '(string|element|boolean)'
  }

  const AttachmentMap = {
    TOP    : 'bottom center',
    RIGHT  : 'middle left',
    BOTTOM : 'top center',
    LEFT   : 'middle right'
  }

  const HOVER_STATE_SHOW = 'show'
  const HOVER_STATE_OUT = 'out'

  const EVENT_HIDE = 'hide'
  const EVENT_HIDDEN = 'hidden'
  const EVENT_SHOW = 'show'
  const EVENT_SHOWN = 'shown'
  const EVENT_INSERTED = 'inserted'
  const EVENT_CLICK = 'click'
  const EVENT_FOCUSIN = 'focusin'
  const EVENT_FOCUSOUT = 'focusout'
  const EVENT_MOUSEENTER = 'mouseenter'
  const EVENT_MOUSELEAVE = 'mouseleave'

  const CLASS_NAME_FADE = 'fade'
  const CLASS_NAME_SHOW = 'show'

  const SELECTOR_TOOLTIP_INNER = '.tooltip-inner'

  const TetherClass = {
    element : false,
    enabled : false
  }

  const TRIGGER_HOVER = 'hover'
  const TRIGGER_FOCUS = 'focus'
  const TRIGGER_CLICK = 'click'
  const TRIGGER_MANUAL = 'manual'


  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Tooltip {

    constructor(element, config) {

      // private
      this._isEnabled        = true
      this._timeout          = 0
      this._hoverState       = ''
      this._activeTrigger    = {}
      this._isTransitioning  = false
      this._tether           = null

      // protected
      this.element = element
      this.config  = this._getConfig(config)
      this.tip     = null

      this._setListeners()

    }


    // getters

    static get VERSION() {
      return VERSION
    }

    static get Default() {
      return Default
    }

    static get NAME() {
      return NAME
    }

    static get DATA_KEY() {
      return DATA_KEY
    }

    static getEvent(eventName) {
      return `${eventName}${EVENT_KEY}`
    }

    static get EVENT_KEY() {
      return EVENT_KEY
    }

    static get DefaultType() {
      return DefaultType
    }


    // public

    enable() {
      this._isEnabled = true
    }

    disable() {
      this._isEnabled = false
    }

    toggleEnabled() {
      this._isEnabled = !this._isEnabled
    }

    toggle(event) {
      if (event) {
        const dataKey = this.constructor.DATA_KEY
        let context = $(event.currentTarget).data(dataKey)

        if (!context) {
          context = new this.constructor(
            event.currentTarget,
            this._getDelegateConfig()
          )
          $(event.currentTarget).data(dataKey, context)
        }

        context._activeTrigger.click = !context._activeTrigger.click

        if (context._isWithActiveTrigger()) {
          context._enter(null, context)
        } else {
          context._leave(null, context)
        }

      } else {

        if ($(this.getTipElement()).hasClass(CLASS_NAME_SHOW)) {
          this._leave(null, this)
          return
        }

        this._enter(null, this)
      }
    }

    dispose() {
      clearTimeout(this._timeout)

      this.cleanupTether()

      $.removeData(this.element, this.constructor.DATA_KEY)

      $(this.element).off(this.constructor.EVENT_KEY)
      $(this.element).closest('.modal').off('hide.bs.modal')

      if (this.tip) {
        $(this.tip).remove()
      }

      this._isEnabled     = null
      this._timeout       = null
      this._hoverState    = null
      this._activeTrigger = null
      this._tether        = null

      this.element = null
      this.config  = null
      this.tip     = null
    }

    show() {
      if ($(this.element).css('display') === 'none') {
        throw new Error('Please use show on visible elements')
      }

      const showEvent = $.Event(this.constructor.getEvent(EVENT_SHOW))
      if (this.isWithContent() && this._isEnabled) {
        if (this._isTransitioning) {
          throw new Error('Tooltip is transitioning')
        }
        $(this.element).trigger(showEvent)

        const isInTheDom = $.contains(
          this.element.ownerDocument.documentElement,
          this.element
        )

        if (showEvent.isDefaultPrevented() || !isInTheDom) {
          return
        }

        const tip   = this.getTipElement()
        const tipId = Util.getUID(this.constructor.NAME)

        tip.setAttribute('id', tipId)
        this.element.setAttribute('aria-describedby', tipId)

        this.setContent()

        if (this.config.animation) {
          $(tip).addClass(CLASS_NAME_FADE)
        }

        const placement  = typeof this.config.placement === 'function' ?
          this.config.placement.call(this, tip, this.element) :
          this.config.placement

        const attachment = this._getAttachment(placement)

        const container = this.config.container === false ? document.body : $(this.config.container)

        $(tip)
          .data(this.constructor.DATA_KEY, this)
          .appendTo(container)

        $(this.element).trigger(this.constructor.getEvent(EVENT_INSERTED))

        this._tether = new Tether({
          attachment,
          element         : tip,
          target          : this.element,
          classes         : TetherClass,
          classPrefix     : CLASS_PREFIX,
          offset          : this.config.offset,
          constraints     : this.config.constraints,
          addTargetClasses: false
        })

        Util.reflow(tip)
        this._tether.position()

        $(tip).addClass(CLASS_NAME_SHOW)

        const complete = () => {
          const prevHoverState = this._hoverState
          this._hoverState   = null
          this._isTransitioning = false

          $(this.element).trigger(this.constructor.getEvent(EVENT_SHOWN))

          if (prevHoverState === HOVER_STATE_OUT) {
            this._leave(null, this)
          }
        }

        if (Util.supportsTransitionEnd() && $(this.tip).hasClass(CLASS_NAME_FADE)) {
          this._isTransitioning = true
          $(this.tip)
            .one(Util.TRANSITION_END, complete)
            .emulateTransitionEnd(Tooltip._TRANSITION_DURATION)
          return
        }

        complete()
      }
    }

    hide(callback) {
      const tip       = this.getTipElement()
      const hideEvent = $.Event(this.constructor.getEvent(EVENT_HIDE))
      if (this._isTransitioning) {
        throw new Error('Tooltip is transitioning')
      }
      const complete  = () => {
        if (this._hoverState !== HOVER_STATE_SHOW && tip.parentNode) {
          tip.parentNode.removeChild(tip)
        }

        this.element.removeAttribute('aria-describedby')
        $(this.element).trigger(this.constructor.getEvent(EVENT_HIDDEN))
        this._isTransitioning = false
        this.cleanupTether()

        if (callback) {
          callback()
        }
      }

      $(this.element).trigger(hideEvent)

      if (hideEvent.isDefaultPrevented()) {
        return
      }

      $(tip).removeClass(CLASS_NAME_SHOW)

      this._activeTrigger[TRIGGER_CLICK] = false
      this._activeTrigger[TRIGGER_FOCUS] = false
      this._activeTrigger[TRIGGER_HOVER] = false

      if (Util.supportsTransitionEnd() &&
          $(this.tip).hasClass(CLASS_NAME_FADE)) {
        this._isTransitioning = true
        $(tip)
          .one(Util.TRANSITION_END, complete)
          .emulateTransitionEnd(TRANSITION_DURATION)

      } else {
        complete()
      }

      this._hoverState = ''
    }


    // protected

    isWithContent() {
      return Boolean(this.getTitle())
    }

    getTipElement() {
      return this.tip = this.tip || $(this.config.template)[0]
    }

    setContent() {
      const $tip = $(this.getTipElement())

      this.setElementContent($tip.find(SELECTOR_TOOLTIP_INNER), this.getTitle())

      $tip.removeClass(`${CLASS_NAME_FADE} ${CLASS_NAME_SHOW}`)

      this.cleanupTether()
    }

    setElementContent($element, content) {
      const html = this.config.html
      if (typeof content === 'object' && (content.nodeType || content.jquery)) {
        // content is a DOM node or a jQuery
        if (html) {
          if (!$(content).parent().is($element)) {
            $element.empty().append(content)
          }
        } else {
          $element.text($(content).text())
        }
      } else {
        $element[html ? 'html' : 'text'](content)
      }
    }

    getTitle() {
      let title = this.element.getAttribute('data-original-title')

      if (!title) {
        title = typeof this.config.title === 'function' ?
          this.config.title.call(this.element) :
          this.config.title
      }

      return title
    }

    cleanupTether() {
      if (this._tether) {
        this._tether.destroy()
      }
    }


    // private

    _getAttachment(placement) {
      return AttachmentMap[placement.toUpperCase()]
    }

    _setListeners() {
      const triggers = this.config.trigger.split(' ')

      triggers.forEach((trigger) => {
        if (trigger === 'click') {
          $(this.element).on(
            this.constructor.getEvent(EVENT_CLICK),
            this.config.selector,
            (event) => this.toggle(event)
          )

        } else if (trigger !== TRIGGER_MANUAL) {
          const eventIn  = trigger === TRIGGER_HOVER ?
            this.constructor.getEvent(EVENT_MOUSEENTER) :
            this.constructor.getEvent(EVENT_FOCUSIN)
          const eventOut = trigger === TRIGGER_HOVER ?
            this.constructor.getEvent(EVENT_MOUSELEAVE) :
            this.constructor.getEvent(EVENT_FOCUSOUT)

          $(this.element)
            .on(
              eventIn,
              this.config.selector,
              (event) => this._enter(event)
            )
            .on(
              eventOut,
              this.config.selector,
              (event) => this._leave(event)
            )
        }

        $(this.element).closest('.modal').on(
          'hide.bs.modal',
          () => this.hide()
        )
      })

      if (this.config.selector) {
        this.config = $.extend({}, this.config, {
          trigger  : 'manual',
          selector : ''
        })
      } else {
        this._fixTitle()
      }
    }

    _fixTitle() {
      const titleType = typeof this.element.getAttribute('data-original-title')
      if (this.element.getAttribute('title') ||
         titleType !== 'string') {
        this.element.setAttribute(
          'data-original-title',
          this.element.getAttribute('title') || ''
        )
        this.element.setAttribute('title', '')
      }
    }

    _enter(event, context) {
      const dataKey = this.constructor.DATA_KEY

      context = context || $(event.currentTarget).data(dataKey)

      if (!context) {
        context = new this.constructor(
          event.currentTarget,
          this._getDelegateConfig()
        )
        $(event.currentTarget).data(dataKey, context)
      }

      if (event) {
        context._activeTrigger[
          event.type === 'focusin' ? TRIGGER_FOCUS : TRIGGER_HOVER
        ] = true
      }

      if ($(context.getTipElement()).hasClass(CLASS_NAME_SHOW) ||
         context._hoverState === HOVER_STATE_SHOW) {
        context._hoverState = HOVER_STATE_SHOW
        return
      }

      clearTimeout(context._timeout)

      context._hoverState = HOVER_STATE_SHOW

      if (!context.config.delay || !context.config.delay.show) {
        context.show()
        return
      }

      context._timeout = setTimeout(() => {
        if (context._hoverState === HOVER_STATE_SHOW) {
          context.show()
        }
      }, context.config.delay.show)
    }

    _leave(event, context) {
      const dataKey = this.constructor.DATA_KEY

      context = context || $(event.currentTarget).data(dataKey)

      if (!context) {
        context = new this.constructor(
          event.currentTarget,
          this._getDelegateConfig()
        )
        $(event.currentTarget).data(dataKey, context)
      }

      if (event) {
        context._activeTrigger[
          event.type === 'focusout' ? TRIGGER_FOCUS : TRIGGER_HOVER
        ] = false
      }

      if (context._isWithActiveTrigger()) {
        return
      }

      clearTimeout(context._timeout)

      context._hoverState = HOVER_STATE_OUT

      if (!context.config.delay || !context.config.delay.hide) {
        context.hide()
        return
      }

      context._timeout = setTimeout(() => {
        if (context._hoverState === HOVER_STATE_OUT) {
          context.hide()
        }
      }, context.config.delay.hide)
    }

    _isWithActiveTrigger() {
      for (const trigger in this._activeTrigger) {
        if (this._activeTrigger[trigger]) {
          return true
        }
      }

      return false
    }

    _getConfig(config) {
      config = $.extend(
        {},
        this.constructor.Default,
        $(this.element).data(),
        config
      )

      if (config.delay && typeof config.delay === 'number') {
        config.delay = {
          show : config.delay,
          hide : config.delay
        }
      }

      Util.typeCheckConfig(
        NAME,
        config,
        this.constructor.DefaultType
      )

      return config
    }

    _getDelegateConfig() {
      const config = {}

      if (this.config) {
        for (const key in this.config) {
          if (this.constructor.Default[key] !== this.config[key]) {
            config[key] = this.config[key]
          }
        }
      }

      return config
    }


    // static

    static _jQueryInterface(config) {
      return this.each(function () {
        let data      = $(this).data(DATA_KEY)
        const _config = typeof config === 'object' && config

        if (!data && /dispose|hide/.test(config)) {
          return
        }

        if (!data) {
          data = new Tooltip(this, _config)
          $(this).data(DATA_KEY, data)
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error(`No method named "${config}"`)
          }
          data[config]()
        }
      })
    }

  }


  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME]             = Tooltip._jQueryInterface
  $.fn[NAME].Constructor = Tooltip
  $.fn[NAME].noConflict  = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Tooltip._jQueryInterface
  }

  return Tooltip

})(jQuery)

export default Tooltip
