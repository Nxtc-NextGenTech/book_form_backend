"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const api_error_1 = require("../../utils/api-error");
const supabase_helpers_1 = require("../../utils/supabase-helpers");
class OrdersService {
    constructor(ordersRepository) {
        this.ordersRepository = ordersRepository;
    }
    roundMoney(value) {
        return Math.round(value * 100) / 100;
    }
    sumPayments(rows) {
        return rows.reduce((sum, row) => sum + Number(row.amount), 0);
    }
    csvCell(value) {
        return `"${String(value ?? "").replace(/"/g, '""')}"`;
    }
    csvRow(columns) {
        return columns.map((column) => this.csvCell(column)).join(",");
    }
    sortClasses(classes) {
        return [...classes].sort((a, b) => {
            const aNum = Number(a);
            const bNum = Number(b);
            if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
                return aNum - bNum;
            }
            return a.localeCompare(b);
        });
    }
    assertDeadline(formEndDate) {
        if (!formEndDate) {
            return;
        }
        const deadline = new Date(formEndDate).getTime();
        if (Date.now() > deadline) {
            throw new api_error_1.ApiError(403, "Order editing deadline has passed");
        }
    }
    async buildPricing(payload) {
        const itemsResult = await this.ordersRepository.fetchItemsByIds(payload.institutionId, payload.items.map((item) => item.itemId));
        (0, supabase_helpers_1.throwOnError)(itemsResult.error);
        const catalogItems = itemsResult.data ?? [];
        if (catalogItems.length !== payload.items.length) {
            throw new api_error_1.ApiError(422, "One or more requested items are invalid");
        }
        const priceMap = new Map(catalogItems.map((item) => [item.id, Number(item.price)]));
        const rows = payload.items.map((item) => {
            const price = priceMap.get(item.itemId);
            if (!price) {
                throw new api_error_1.ApiError(422, `Price unavailable for item ${item.itemId}`);
            }
            return {
                itemId: item.itemId,
                quantity: item.quantity,
                price,
                total: price * item.quantity
            };
        });
        const totalAmount = rows.reduce((sum, row) => sum + row.total, 0);
        return {
            rows,
            totalAmount
        };
    }
    async createParentOrder(payload) {
        const studentResult = await this.ordersRepository.findStudentByIdAndParent(payload.studentId, payload.parentId);
        const student = (0, supabase_helpers_1.unwrapSingle)(studentResult.data, studentResult.error, "Student not found");
        const institutionResult = await this.ordersRepository.findInstitutionById(student.institution_id);
        const institution = (0, supabase_helpers_1.unwrapSingle)(institutionResult.data, institutionResult.error, "Institution not found");
        this.assertDeadline(institution.form_end_date);
        const pricing = await this.buildPricing({
            institutionId: student.institution_id,
            items: payload.items
        });
        const orderResult = await this.ordersRepository.createOrder({
            studentId: student.id,
            institutionId: student.institution_id,
            totalAmount: pricing.totalAmount
        });
        const order = (0, supabase_helpers_1.unwrapSingle)(orderResult.data, orderResult.error, "Unable to create order");
        const orderItemsResult = await this.ordersRepository.insertOrderItems(pricing.rows.map((row) => ({
            order_id: order.id,
            item_id: row.itemId,
            quantity: row.quantity,
            price: row.price,
            total: row.total
        })));
        (0, supabase_helpers_1.throwOnError)(orderItemsResult.error);
        return order;
    }
    async updateParentOrder(payload) {
        const orderResult = await this.ordersRepository.findOrderForParent(payload.orderId, payload.parentId);
        const order = (0, supabase_helpers_1.unwrapSingle)(orderResult.data, orderResult.error, "Order not found");
        if (order.status === "DISTRIBUTED") {
            throw new api_error_1.ApiError(403, "Distributed order cannot be edited");
        }
        const institutionResult = await this.ordersRepository.findInstitutionById(order.institution_id);
        const institution = (0, supabase_helpers_1.unwrapSingle)(institutionResult.data, institutionResult.error);
        this.assertDeadline(institution.form_end_date);
        const pricing = await this.buildPricing({
            institutionId: order.institution_id,
            items: payload.items
        });
        const deleteResult = await this.ordersRepository.deleteOrderItems(order.id);
        (0, supabase_helpers_1.throwOnError)(deleteResult.error);
        const insertResult = await this.ordersRepository.insertOrderItems(pricing.rows.map((row) => ({
            order_id: order.id,
            item_id: row.itemId,
            quantity: row.quantity,
            price: row.price,
            total: row.total
        })));
        (0, supabase_helpers_1.throwOnError)(insertResult.error);
        const updatedResult = await this.ordersRepository.updateOrder(order.id, {
            totalAmount: pricing.totalAmount,
            status: order.status
        });
        const updatedOrder = (0, supabase_helpers_1.unwrapSingle)(updatedResult.data, updatedResult.error, "Unable to update order");
        const paidRowsResult = await this.ordersRepository.totalPaidForOrder(order.id);
        (0, supabase_helpers_1.throwOnError)(paidRowsResult.error);
        const paidTotal = this.roundMoney(this.sumPayments(paidRowsResult.data ?? []));
        const orderTotal = this.roundMoney(Number(updatedOrder.total_amount));
        const nextPaymentStatus = paidTotal >= orderTotal ? "PAID" : "PENDING";
        const paymentStatusResult = await this.ordersRepository.updateOrderPaymentStatus(order.id, nextPaymentStatus);
        (0, supabase_helpers_1.throwOnError)(paymentStatusResult.error);
        return {
            ...updatedOrder,
            payment_status: nextPaymentStatus
        };
    }
    async distributeOrder(payload) {
        const result = await this.ordersRepository.markOrderDistributed(payload.orderId, payload.institutionId);
        return (0, supabase_helpers_1.unwrapSingle)(result.data, result.error, "Order not found");
    }
    async getInstitutionOrders(institutionId) {
        const result = await this.ordersRepository.listInstitutionOrders(institutionId);
        (0, supabase_helpers_1.throwOnError)(result.error);
        return (result.data ?? []).map((order) => {
            const payments = order.parent_payments ?? [];
            const paidAmount = this.roundMoney(this.sumPayments(payments));
            const totalAmount = this.roundMoney(Number(order.total_amount));
            const balanceAmount = this.roundMoney(Math.max(0, totalAmount - paidAmount));
            const paymentStatus = balanceAmount <= 0 ? "PAID" : "PENDING";
            return {
                ...order,
                payment_status: paymentStatus,
                paid_amount: paidAmount,
                balance_amount: balanceAmount
            };
        });
    }
    async getWholesalerSummary(institutionId) {
        const result = await this.ordersRepository.listInstitutionOrderItemRows(institutionId);
        (0, supabase_helpers_1.throwOnError)(result.error);
        const itemMap = new Map();
        for (const row of result.data ?? []) {
            const order = Array.isArray(row.orders) ? row.orders[0] : row.orders;
            if (!order || order.status === "DISTRIBUTED") {
                continue;
            }
            const item = Array.isArray(row.institution_items)
                ? row.institution_items[0]
                : row.institution_items;
            const current = itemMap.get(row.item_id) ?? {
                itemId: row.item_id,
                name: item?.name ?? "Unknown Item",
                category: item?.category ?? "CUSTOM",
                totalQuantity: 0,
                estimatedAmount: 0,
                orderIds: new Set()
            };
            current.totalQuantity += Number(row.quantity);
            current.estimatedAmount += Number(row.total);
            current.orderIds.add(order.id);
            itemMap.set(row.item_id, current);
        }
        const items = Array.from(itemMap.values())
            .map((entry) => ({
            itemId: entry.itemId,
            name: entry.name,
            category: entry.category,
            totalQuantity: entry.totalQuantity,
            estimatedAmount: entry.estimatedAmount,
            orderCount: entry.orderIds.size
        }))
            .sort((a, b) => b.totalQuantity - a.totalQuantity);
        return {
            totalDistinctItems: items.length,
            totalQuantity: items.reduce((sum, item) => sum + item.totalQuantity, 0),
            estimatedAmount: items.reduce((sum, item) => sum + item.estimatedAmount, 0),
            items
        };
    }
    async getParentOrderInvoice(parentId, orderId) {
        const result = await this.ordersRepository.findParentOrderInvoice(orderId, parentId);
        const order = (0, supabase_helpers_1.unwrapSingle)(result.data, result.error, "Order not found");
        const institution = Array.isArray(order.institutions) ? order.institutions[0] : order.institutions;
        const student = Array.isArray(order.students) ? order.students[0] : order.students;
        const orderItems = order.order_items ?? [];
        const payments = order.parent_payments ?? [];
        const totalItems = orderItems.reduce((sum, item) => sum + Number(item.quantity), 0);
        const paidAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        const totalAmount = Number(order.total_amount);
        return {
            order: {
                id: order.id,
                status: order.status,
                paymentStatus: order.payment_status,
                createdAt: order.created_at,
                totalItems,
                totalAmount,
                paidAmount,
                balanceAmount: Math.max(0, totalAmount - paidAmount)
            },
            institution,
            student,
            items: orderItems.map((item) => {
                const catalogItem = Array.isArray(item.institution_items)
                    ? item.institution_items[0]
                    : item.institution_items;
                return {
                    name: catalogItem?.name ?? "Unknown Item",
                    category: catalogItem?.category ?? "CUSTOM",
                    quantity: item.quantity,
                    price: item.price,
                    total: item.total
                };
            }),
            payments
        };
    }
    async exportInstitutionOrdersCsv(institutionId) {
        const orders = await this.getInstitutionOrders(institutionId);
        const classSet = new Set();
        for (const order of orders) {
            const student = Array.isArray(order.students) ? order.students[0] : order.students;
            classSet.add(student?.class ?? "Unknown");
        }
        const classLabels = this.sortClasses(Array.from(classSet));
        const classSummary = new Map();
        const itemSummary = new Map();
        for (const order of orders) {
            const student = Array.isArray(order.students) ? order.students[0] : order.students;
            const className = student?.class ?? "Unknown";
            const studentKey = `${student?.id ?? ""}|${student?.name ?? ""}|${student?.division ?? ""}`;
            const items = order.order_items ?? [];
            const totalItems = items.reduce((sum, item) => sum + Number(item.quantity), 0);
            const classRow = classSummary.get(className) ?? {
                studentKeys: new Set(),
                orders: 0,
                totalItems: 0,
                totalAmount: 0,
                pendingOrders: 0,
                distributedOrders: 0,
                paidOrders: 0,
                pendingPayments: 0
            };
            classRow.studentKeys.add(studentKey);
            classRow.orders += 1;
            classRow.totalItems += totalItems;
            classRow.totalAmount += Number(order.total_amount);
            if (order.status === "PENDING" || order.status === "CONFIRMED") {
                classRow.pendingOrders += 1;
            }
            if (order.status === "DISTRIBUTED") {
                classRow.distributedOrders += 1;
            }
            if (order.payment_status === "PAID") {
                classRow.paidOrders += 1;
            }
            else {
                classRow.pendingPayments += 1;
            }
            classSummary.set(className, classRow);
            if (order.status === "DISTRIBUTED") {
                continue;
            }
            for (const item of items) {
                const catalogItem = Array.isArray(item.institution_items)
                    ? item.institution_items[0]
                    : item.institution_items;
                const itemName = catalogItem?.name ?? "Unknown Item";
                const category = catalogItem?.category ?? "CUSTOM";
                const unitPrice = Number(item.price);
                const key = `${category}::${itemName}::${unitPrice.toFixed(2)}`;
                const row = itemSummary.get(key) ?? {
                    category,
                    itemName,
                    unitPrice,
                    classQty: new Map(),
                    totalQty: 0,
                    totalAmount: 0
                };
                const quantity = Number(item.quantity);
                row.classQty.set(className, (row.classQty.get(className) ?? 0) + quantity);
                row.totalQty += quantity;
                row.totalAmount += Number(item.total);
                itemSummary.set(key, row);
            }
        }
        const lines = [];
        lines.push(this.csvRow(["DETAILED ORDER EXPORT"]));
        lines.push(this.csvRow(["Generated At", new Date().toISOString()]));
        lines.push(this.csvRow(["Total Orders", orders.length]));
        lines.push("");
        lines.push(this.csvRow(["CLASS SUMMARY"]));
        lines.push(this.csvRow([
            "class",
            "students",
            "orders",
            "total_items",
            "total_amount",
            "pending_orders",
            "distributed_orders",
            "paid_orders",
            "pending_payments"
        ]));
        for (const className of classLabels) {
            const row = classSummary.get(className);
            lines.push(this.csvRow([
                className,
                row?.studentKeys.size ?? 0,
                row?.orders ?? 0,
                row?.totalItems ?? 0,
                Number(row?.totalAmount ?? 0).toFixed(2),
                row?.pendingOrders ?? 0,
                row?.distributedOrders ?? 0,
                row?.paidOrders ?? 0,
                row?.pendingPayments ?? 0
            ]));
        }
        lines.push("");
        lines.push(this.csvRow(["ITEM REQUIREMENT BY CLASS (PENDING + CONFIRMED)"]));
        lines.push(this.csvRow([
            "category",
            "item_name",
            "unit_price",
            ...classLabels.map((className) => `class_${className}`),
            "total_qty",
            "total_amount"
        ]));
        const itemRows = Array.from(itemSummary.values()).sort((a, b) => {
            const categoryCompare = a.category.localeCompare(b.category);
            if (categoryCompare !== 0) {
                return categoryCompare;
            }
            return a.itemName.localeCompare(b.itemName);
        });
        for (const row of itemRows) {
            lines.push(this.csvRow([
                row.category,
                row.itemName,
                row.unitPrice.toFixed(2),
                ...classLabels.map((className) => row.classQty.get(className) ?? 0),
                row.totalQty,
                row.totalAmount.toFixed(2)
            ]));
        }
        lines.push("");
        lines.push(this.csvRow(["DETAILED ORDERS GROUPED BY CLASS"]));
        lines.push(this.csvRow([
            "class",
            "order_id",
            "student_name",
            "division",
            "status",
            "payment_status",
            "item_count",
            "total_amount",
            "created_at",
            "items_breakdown"
        ]));
        for (const className of classLabels) {
            const classOrders = orders.filter((order) => {
                const student = Array.isArray(order.students) ? order.students[0] : order.students;
                return (student?.class ?? "Unknown") === className;
            });
            for (const order of classOrders) {
                const student = Array.isArray(order.students) ? order.students[0] : order.students;
                const items = order.order_items ?? [];
                const itemCount = items.reduce((sum, item) => sum + Number(item.quantity), 0);
                const itemBreakdown = items
                    .map((item) => {
                    const catalogItem = Array.isArray(item.institution_items)
                        ? item.institution_items[0]
                        : item.institution_items;
                    return `${catalogItem?.name ?? "Item"} x ${item.quantity}`;
                })
                    .join(" | ");
                lines.push(this.csvRow([
                    className,
                    order.id,
                    student?.name ?? "",
                    student?.division ?? "",
                    order.status,
                    order.payment_status,
                    itemCount,
                    Number(order.total_amount).toFixed(2),
                    order.created_at,
                    itemBreakdown
                ]));
            }
        }
        return lines.join("\n");
    }
}
exports.OrdersService = OrdersService;
