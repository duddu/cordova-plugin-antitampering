#import "AntiTamperingPlugin.h"

@implementation AntiTamperingPlugin

- (void)pluginInitialize{
    self.assetsHashes = @{};
    [self checkAndStopExecution];
}

-(void)checkAssetsIntegrity{
    [self.assetsHashes enumerateKeysAndObjectsUsingBlock:^(NSString* file, NSString* hash, BOOL* stop) {
        
        NSData* decodedFile = [[NSData alloc] initWithBase64EncodedString:file options:0];
        NSString* fileName = [[NSString alloc] initWithData:decodedFile encoding:NSUTF8StringEncoding];
        
        NSString* path = [[NSBundle mainBundle] pathForResource:[fileName stringByDeletingPathExtension] ofType:[fileName pathExtension] inDirectory:@"www"];
        if (path == nil) {
            @throw([NSException exceptionWithName:@"PathNotFoundException" reason:[@"No readable path retrieved for file " stringByAppendingString:fileName] userInfo:nil]);
        }
        NSData* fileData = [NSData dataWithContentsOfFile:path options:NSDataReadingUncached error:nil];
        
        unsigned char digest[CC_SHA256_DIGEST_LENGTH];
        CC_SHA256( fileData.bytes, (CC_LONG)fileData.length, digest );
        NSMutableString* output = [NSMutableString stringWithCapacity:CC_SHA256_DIGEST_LENGTH * 2];
        for (int i = 0; i < CC_SHA256_DIGEST_LENGTH; i++) {
            [output appendFormat:@"%02x", digest[i]];
        }
        
        if (![output isEqualToString:hash]) {
            @throw([NSException exceptionWithName:@"HashNotMatchException" reason:[@"Hash doesn't match for file " stringByAppendingString:fileName] userInfo:nil]);
        }
        
    }];
}

-(void)debugDetection{
    #ifdef DEBUG
        @throw([NSException exceptionWithName:@"DebugDetectedException" reason:@"App running in Debug mode" userInfo:nil]);
    #endif
}

-(void)checkAndStopExecution{
    @try {
        [self debugDetection];
        [self checkAssetsIntegrity];
    } @catch (NSException *exception) {
        NSLog(@"Anti-Tampering check failed! %@: %@", [exception name], [exception reason]);
        int *x = NULL; *x = 7;
    }
}

-(void)verify:(CDVInvokedUrlCommand*)command{

    static CDVPluginResult* result = nil;

    [self.commandDelegate runInBackground:^{
        @try {
            [self debugDetection];
            [self checkAssetsIntegrity];
            NSDictionary* response = @{
                @"assets": @{
                    @"count": [NSNumber numberWithUnsignedInteger:[[self.assetsHashes allKeys] count]]
                }
            };
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:response];
        } @catch (NSException* exception) {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[@"AntiTampering failed: " stringByAppendingString:exception.reason]];
        } @finally {
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        }
    }];

}

@end
