import PropTypes from 'prop-types';
import React from 'react';
import { Dimensions } from 'react-native';
import ViewOverflow from '../overflow';
import { SliderLine } from './SliderLine';
import { SliderWrap } from './SliderWrap';
import { sliderWrapWidth, styles } from './style';

const { width: windowWidth } = Dimensions.get('window');

export class Slider extends React.Component {
    constructor(props) {
        super(props);
        const { max } = props;
        this.state = {
            left: 0,
            right: 0,
            start: 0,
            end: max
        };
    }

    onLayout = ({ layout }) => {
        const { max, showLeft } = this.props;
        const { width } = layout;
        this.componentWidth = width;
        this.paddingRight = this.paddingLeft = (windowWidth - width) / 2;
        this.scaleWidth = (width - (!showLeft ? sliderWrapWidth : sliderWrapWidth * 2)) / max;
        this.resizePosition(this.props);
    };

    resizePosition = props => {
        const { max, showLeft } = this.props;
        const { start = this.state.start, end = this.state.end } = props;
        let left = showLeft ? start * this.scaleWidth : 0;
        let right = (max - end) * this.scaleWidth;
        showLeft &&
            this.startWrap.setNativeProps({
                style: { left }
            });
        this.endWrap.setNativeProps({
            style: { right }
        });
        this.lineWrap.setNativeProps({
            style: { left: showLeft ? left + sliderWrapWidth : 0, right: right + sliderWrapWidth }
        });
        this.setState({
            start,
            left,
            right,
            end
        });
    };

    onDragStart = ({ nativeEvent }) => {
        const { right: stateRight } = this.state;
        const left = nativeEvent.pageX - this.paddingLeft;
        const total = left + stateRight + sliderWrapWidth * 2;
        if (left < 0) return;
        if (total >= this.componentWidth) return;
        let start = Math.round(left / this.scaleWidth);
        this.setState({
            left,
            start
        });
        this.startWrap.setNativeProps({
            style: { left }
        });
        this.lineWrap.setNativeProps({
            style: { left: left + sliderWrapWidth }
        });
        this.onChange({ start, end: this.state.end });
    };

    onDragEnd = ({ nativeEvent }) => {
        const { left: stateLeft } = this.state;
        const { showLeft } = this.props;
        const right = windowWidth - nativeEvent.pageX - this.paddingRight;
        const _sliderWrapWidth = !showLeft ? sliderWrapWidth : sliderWrapWidth * 2;
        const total = stateLeft + right + _sliderWrapWidth;
        if (right < 0) return;
        if (total >= this.componentWidth) return;
        let end = Math.round((nativeEvent.pageX - this.paddingRight - _sliderWrapWidth) / this.scaleWidth);
        this.setState({
            right,
            end
        });
        this.endWrap.setNativeProps({
            style: { right }
        });
        this.lineWrap.setNativeProps({
            style: { right: right + sliderWrapWidth }
        });
        this.onChange({ start: this.state.start, end });
    };

    onChange = ({ start, end }) => {
        const { onChange } = this.props;
        onChange && onChange({ start, end });
    };
    render() {
        const { showLeft, showPopover, startMessage = '', endMessage = '', style } = this.props;
        return (
            <ViewOverflow
                style={[styles.style_slider_container_view, style]}
                onLayout={({ nativeEvent }) => this.onLayout(nativeEvent)}>
                {showLeft ? (
                    <SliderWrap
                        showPopover={showPopover}
                        message={startMessage}
                        refs={ref => (this.startWrap = ref)}
                        onDrag={this.onDragStart}
                    />
                ) : null}
                <SliderLine refs={ref => (this.lineWrap = ref)} showLeft={showLeft} />
                <SliderWrap
                    showPopover={showPopover}
                    message={endMessage}
                    refs={ref => (this.endWrap = ref)}
                    onDrag={this.onDragEnd}
                />
            </ViewOverflow>
        );
    }
}

Slider.propTypes = {
    max: PropTypes.number, // 最大值
    showLeft: PropTypes.bool, // 是否展示左侧滑块
    showPopover: PropTypes.bool, // 是否展示Popover
    startMessage: PropTypes.string, // 左侧滑块Popover内容
    endMessage: PropTypes.string, // 右侧滑块Popover内容
    style: PropTypes.any, // 根节点样式
    onChange: PropTypes.func // onChange回调方法
};

Slider.defaultProps = {
    max: 100,
    showLeft: false,
    showPopover: true
};
