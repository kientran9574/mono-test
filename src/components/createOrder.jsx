/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
    Form,
    Input,
    Select,
    Card,
    Radio,
    Button,
    InputNumber,
    List,
    Space,
    Divider,
    message,
} from "antd";
import ConfirmOrder from "./confirmOrder";

const { Option } = Select;

const mockCoupons = {
    "DISCOUNT10": { type: "percent", value: 10 }, // Giảm 10%
    "SALE50": { type: "amount", value: 50000 },  // Giảm 50,000 VNĐ
};

const mockProducts = [
    { id: 1, name: "Sản phẩm A", price: 100000, discount: 10 },
    { id: 2, name: "Sản phẩm B", price: 200000, discount: 15 },
    { id: 3, name: "Sản phẩm C", price: 300000, discount: 0 },
];

const CreateOrder = () => {
    // State tổng hợp để lưu thông tin đơn hàng
    const [order, setOrder] = useState({
        name: "",
        email: "",
        phone: "",
        cart: [],
        paymentMethod: "cash",
        total: 0,
        userCash: 0,
    });
    const [isShowModal, setIsShowModal] = useState(false)

    const [form] = Form.useForm()
    const addToCart = (productId) => {
        const product = mockProducts.find((item) => item.id === productId);
        if (product) {
            const itemExists = order.cart.find((item) => item.id === productId);
            if (itemExists) {
                message.warning("Sản phẩm đã có trong giỏ hàng!");
                return;
            }
            const newCart = [...order.cart, { ...product, quantity: 1, coupon: null }];
            setOrder((prev) => ({
                ...prev,
                cart: newCart,
                total: calculateTotal(newCart),
            }));
        }
    };
    const applyCoupon = (productId, couponCode) => {
        const coupon = mockCoupons[couponCode]
        if (!coupon) {
            message.error("Mã giảm giá không hợp lệ!")
            return
        }
        const newCart = order.cart.map((item) => {
            if (item.id === productId) {
                return { ...item, coupon: coupon }
            }
            return item
        })
        setOrder((prev) => ({
            ...prev,
            cart: newCart,
            total: calculateTotal(newCart),
        }))
        message.success("Mã khuyến mãi đã được áp dụng!");
    }
    const updateQuantity = (productId, quantity) => {
        const newCart = order.cart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
        );
        setOrder((prev) => ({
            ...prev,
            cart: newCart,
            total: calculateTotal(newCart),
        }));
    };

    const calculateTotal = (cartItems) => {
        return cartItems.reduce((sum, item) => {
            let itemTotal = item.price * item.quantity;
            if (item.coupon) {
                if (item.coupon.type === "percent") {
                    itemTotal -= (item.coupon.value / 100) * itemTotal;
                } else if (item.coupon.type === "amount") {
                    itemTotal -= item.coupon.value;
                }
            }
            return sum + itemTotal * (1 - item.discount / 100);
        }, 0);
    };

    const handleInputChange = (field, value) => {
        setOrder((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const showConfirmModal = () => {
        if (order.cart.length === 0) {
            message.warning("Giỏ hàng của bạn đang trống")
            return
        }
        setIsShowModal(true)
    }
    const closeConfirmModal = () => {
        setIsShowModal(false);
        form.resetFields(); // Reset các field
        setOrder({
            name: "",
            email: "",
            phone: "",
            cart: [],
            paymentMethod: "cash",
            total: 0,
            userCash: 0,
        });
    };
    const products = form.getFieldsValue("product")
    const removeProduct = (productId) => {
        // Lọc giỏ hàng để loại bỏ sản phẩm bị xóa
        const newCart = order.cart.filter((item) => item.id !== productId)
        // Tìm sản phẩm kế tiếp trong giỏ hàng 
        const newProduct = newCart.length > 0 ? newCart[0].id : null
        setOrder((prev) => ({
            ...prev,
            cart: newCart,
            total: calculateTotal(newCart)
        }))
        if (newProduct) {
            form.setFieldsValue({ product: newProduct })
        } else {
            form.resetFields(["product"])
        }
    }
    return (
        <>
            <Card title="Tạo đơn hàng" className="shadow" style={{
                "width": "750px"
            }}>
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tên khách hàng"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên khách hàng!" }]}
                    >
                        <Input
                            placeholder="Nhập tên khách hàng"
                            onChange={(e) => handleInputChange("name", e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Email khách hàng"
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Vui lòng nhập địa chỉ email hợp lệ!" },
                        ]}
                    >
                        <Input
                            placeholder="Nhập email khách hàng"
                            onChange={(e) =>
                                handleInputChange("email", e.target.value)
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[
                            { required: true, message: "Vui lòng nhập số điện thoại!" },
                            {
                                pattern: /^[0-9]{10}$/,
                                message: "Số điện thoại phải bao gồm đúng 10 chữ số!",
                            },
                        ]}
                    >
                        <Input
                            placeholder="Nhập số điện thoại"
                            onChange={(e) =>
                                handleInputChange("phone", e.target.value)
                            }
                        />
                    </Form.Item>

                    <Form.Item label="Thêm sản phẩm vào giỏ hàng" name={"product"}>
                        <Select
                            placeholder="Chọn sản phẩm"
                            allowClear
                            className="shadow"
                            onSelect={(value) => addToCart(value)}
                        >
                            {mockProducts.map((product) => (
                                <Option key={product.id} value={product.id}>
                                    {product.name} - {product.price.toLocaleString()} VNĐ
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Divider>Giỏ hàng</Divider>
                    <List
                        bordered
                        dataSource={order.cart}
                        className="motion-preset-bounce"
                        renderItem={(item) => (
                            <div>       <List.Item actions={[
                                <>
                                    <Button className="motion-preset-shrink motion-duration-1500" danger onClick={() => removeProduct(item.id)}>Xóa</Button>
                                </>
                            ]}>
                                <Space direction={"vertical"} className="motion-preset-bounce motion-duration-500">
                                    <Space>
                                        <span>{item.name}</span>
                                        <span>
                                            {item.price.toLocaleString()} VNĐ - Giảm giá {item.discount}%
                                        </span>
                                        <InputNumber
                                            min={1}
                                            value={item.quantity}
                                            onChange={(value) => updateQuantity(item.id, value)}
                                        />
                                        <Space>
                                            <Input
                                                placeholder="Mã khuyến mãi"
                                                style={{ width: 150 }}
                                                onPressEnter={(e) =>
                                                    applyCoupon(item.id, e.target.value.trim())
                                                }
                                            />
                                            {item.coupon && (
                                                <span>
                                                    Đã áp dụng:{" "}
                                                    {item.coupon.type === "percent"
                                                        ? `${item.coupon.value}%`
                                                        : `${item.coupon.value.toLocaleString()} VNĐ`}
                                                </span>
                                            )}
                                        </Space>
                                    </Space>

                                </Space>
                            </List.Item></div>

                        )}
                    />
                    <Divider />

                    <Card>
                        <div>
                            <strong>Tổng giá trị đơn hàng:</strong>{" "}
                            {order.total.toLocaleString()} VNĐ
                        </div>
                    </Card>

                    <Form.Item label="Phương thức thanh toán">
                        <Radio.Group
                            onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                            value={order.paymentMethod}
                        >
                            <Radio value="cash">Tiền mặt</Radio>
                            <Radio value="card">Thẻ</Radio>
                        </Radio.Group>
                    </Form.Item>

                    {order.paymentMethod === "cash" && (
                        <Form.Item name={"userCash"} label="Số tiền khách đưa">
                            <InputNumber
                                min={order.total}
                                onChange={(value) => handleInputChange("userCash", value)}
                            />
                        </Form.Item>
                    )}

                    <Button type="primary" onClick={showConfirmModal} className="motion-preset-focus motion-duration-700">
                        Thanh toán
                    </Button>
                </Form>
            </Card >
            <ConfirmOrder order={order} setOrder={setOrder} isShowModal={isShowModal} closeConfirmModal={closeConfirmModal}></ConfirmOrder></>

    );
};

export default CreateOrder;
