import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { membershipOrderManager, userManager } from '@/storage/database';
import { verifyToken } from '@/lib/auth';
import crypto from 'crypto';

/**
 * 上传支付凭证（转账截图）
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const { user, error } = await extractUserFromRequest(request);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 401 });
    }

    const formData = await request.formData();
    const orderId = formData.get('orderId') as string;
    const proofImage = formData.get('proofImage') as File;
    const transactionId = formData.get('transactionId') as string;
    const remark = formData.get('remark') as string;

    if (!orderId || !proofImage) {
      return NextResponse.json(
        { success: false, error: '缺少订单号或支付凭证' },
        { status: 400 }
      );
    }

    // 验证订单
    const order = await membershipOrderManager.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }

    // 验证订单所有权
    if (order.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: '无权操作此订单' },
        { status: 403 }
      );
    }

    // 验证订单状态
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json(
        { success: false, error: '该订单已支付' },
        { status: 400 }
      );
    }

    // 验证文件大小（5MB）
    const maxSize = 5 * 1024 * 1024;
    if (proofImage.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '图片大小不能超过5MB' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(proofImage.type)) {
      return NextResponse.json(
        { success: false, error: '仅支持JPG、PNG格式图片' },
        { status: 400 }
      );
    }

    // 生成文件名
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    const extension = proofImage.name.split('.').pop();
    const filename = `payment-proof-${timestamp}-${random}.${extension}`;

    // 在MVP阶段，将支付凭证保存到public目录（生产环境应使用对象存储）
    const buffer = Buffer.from(await proofImage.arrayBuffer());

    // 保存文件（这里简化处理，实际应使用对象存储）
    // 由于环境限制，我们暂时将文件信息存储在数据库中
    const proofData = {
      filename,
      size: proofImage.size,
      type: proofImage.type,
      uploadedAt: new Date().toISOString(),
      transactionId: transactionId || null,
      remark: remark || null,
    };

    // 更新订单状态为待审核
    // 注意：这里需要扩展订单表来存储支付凭证信息
    // 暂时使用notes字段存储
    await membershipOrderManager.updateOrderNotes(
      orderId,
      JSON.stringify({
        proof: proofData,
        status: 'PENDING_REVIEW',
      })
    );

    // 更新订单状态
    await membershipOrderManager.updateOrderStatus(orderId, 'PENDING_REVIEW');

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        message: '支付凭证上传成功，等待管理员审核',
        proofData: {
          filename,
          size: proofImage.size,
          uploadedAt: proofData.uploadedAt,
        },
      },
    });
  } catch (error) {
    console.error('上传支付凭证失败:', error);
    return NextResponse.json(
      { success: false, error: '上传支付凭证失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取支付凭证状态
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const { user, error } = await extractUserFromRequest(request);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: '缺少订单号' },
        { status: 400 }
      );
    }

    // 获取订单
    const order = await membershipOrderManager.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }

    // 验证订单所有权
    if (order.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: '无权查看此订单' },
        { status: 403 }
      );
    }

    // 解析支付凭证信息
    let proofData = null;
    if (order.notes) {
      try {
        const notes = JSON.parse(order.notes);
        if (notes.proof) {
          proofData = notes.proof;
        }
      } catch (error) {
        console.error('解析支付凭证信息失败:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        paymentStatus: order.paymentStatus,
        proofData,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('获取支付凭证状态失败:', error);
    return NextResponse.json(
      { success: false, error: '获取支付凭证状态失败' },
      { status: 500 }
    );
  }
}
