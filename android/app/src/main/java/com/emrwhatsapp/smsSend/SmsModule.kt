package com.emrwhatsapp.smsSend

import android.telephony.SmsManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SmsModule(reactContext: ReactApplicationContext) : 
ReactContextBaseJavaModule(reactContext)      
    {

override fun getName(): String {
    return "SmsModule"
}

@ReactMethod
 fun sendSms(message: String, recipient: String, promise: Promise) {
     try {
         val smsManager = SmsManager.getDefault()
          smsManager.sendTextMessage(recipient, null, message, null, null)
         promise.resolve("SMS send successful")
    } catch (e: Exception) {
        promise.reject("SMS_ERROR", e.message)
    }
 }
}