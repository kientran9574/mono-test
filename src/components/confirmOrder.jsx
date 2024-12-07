/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { List, Modal, Space, message } from 'antd'
import React from 'react'

const ConfirmOrder = ({ order, isShowModal, closeConfirmModal, setOrder }) => {

    const { name, email, phone, cart, paymentMethod, total, userCash } = order

    const handlePayment = () => {
        if (paymentMethod === "cash" && userCash < total) {
            message.error("Số tiền khách đưa không đủ!");
            return;
        }
        const change =
            paymentMethod === "cash" ? userCash - total : 0;
        message.success(
            `Thanh toán thành công! ${paymentMethod === "cash"
                ? `Tiền thừa: ${change?.toLocaleString()} VNĐ`
                : ""
            }`
        )
        closeConfirmModal()
    };
    return (
        <>
            <Modal
                title="Xác nhận đơn hàng"
                visible={isShowModal}
                onCancel={closeConfirmModal}
                onOk={handlePayment}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <div>
                    <h3>Thông tin khách hàng</h3>
                    <p><strong>Tên:</strong> {name}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Số điện thoại:</strong> {phone}</p>

                    <h3>Giỏ hàng</h3>
                    <List
                        dataSource={cart}
                        renderItem={(item) => (
                            <List.Item>
                                <Space>
                                    <span>{item.name}</span>
                                    <span>{item.price?.toLocaleString()} VNĐ</span>
                                    <span>Số lượng: {item.quantity}</span>
                                    <span>Giảm giá: {item.discount}%</span>
                                </Space>
                            </List.Item>
                        )}
                    />

                    <h3>Thông tin thanh toán</h3>
                    <p><strong>Phương thức:</strong> {paymentMethod === "cash" ? "Tiền mặt" : "Thẻ"}</p>
                    <p><strong>Tổng tiền:</strong> {total?.toLocaleString()} VNĐ</p>
                    {paymentMethod === "cash" && (
                        <p>
                            <strong>Tiền khách đưa:</strong> {userCash?.toLocaleString()} VNĐ<br />
                            <strong>Tiền thừa:</strong> {(userCash - total)?.toLocaleString()} VNĐ
                        </p>
                    )}
                </div>
            </Modal>
        </>
    )
}

export default ConfirmOrder