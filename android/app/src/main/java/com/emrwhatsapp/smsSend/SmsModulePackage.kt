package com.emrwhatsapp.smsSend

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class SmsModulePackage : ReactPackage {
 override fun createNativeModules(reactContext: ReactApplicationContext): 
 List<NativeModule> {
    return listOf(SmsModule(reactContext))
} 

override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList()
}
}