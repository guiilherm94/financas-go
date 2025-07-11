import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createSubscription } from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  try {
    const { planType } = await request.json()
    
    if (!planType || !['monthly', 'yearly'].includes(planType)) {
      return NextResponse.json(
        { error: 'Tipo de plano inválido' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })
    
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const subscription = await createSubscription(
      session.user.email!,
      planType
    )

    const { error: dbError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: session.user.id,
        mercadopago_subscription_id: subscription.id,
        plan: planType,
        status: 'pending',
        amount: planType === 'monthly' ? 4.90 : 39.90,
      })

    if (dbError) {
      console.error('Erro ao salvar assinatura no banco:', dbError)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      subscription_id: subscription.id,
      init_point: subscription.init_point,
    })
  } catch (error: any) {
    console.error('Erro ao criar assinatura:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
