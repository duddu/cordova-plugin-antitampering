#import <Cordova/CDVPlugin.h>
#include <CommonCrypto/CommonDigest.h>

@interface AntiTamperingPlugin : CDVPlugin

-(void)verify:(CDVInvokedUrlCommand*)command;

@end
