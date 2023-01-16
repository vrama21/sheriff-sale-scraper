import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { PrismaLayer } from '../layers';

export interface SheriffSaleHandlerProps extends NodejsFunctionProps {
  addPrismaLayer?: boolean;
  /**
   * The path to the entry file from the root of the project.
   */
  entry: string;
}

export class SheriffSaleHandler extends NodejsFunction {
  constructor(scope: Construct, id: string, props: SheriffSaleHandlerProps) {
    const { addPrismaLayer, entry } = props;

    const rootDir = path.join(__dirname, '../../');

    super(scope, id, {
      ...props,
      bundling: {
        commandHooks: {
          beforeBundling(_inputDir: string, _outputDir: string) {
            return [];
          },
          beforeInstall(inputDir: string, outputDir: string) {
            return [`cp -R ${inputDir}/prisma ${outputDir}/`];
          },
          afterBundling(_inputDir: string, outputDir: string) {
            return [
              `cd ${outputDir}`,
              `npx prisma generate`,
              `rm -rf node_modules/@prisma/engines`,
              `rm -rf node_modules/@prisma/client/node_modules node_modules/.bin node_modules/prisma`,
            ];
          },
        },
        nodeModules: ['@prisma/client', 'prisma'],
      },
      entry: path.join(rootDir, entry),
      handler: 'handler',
      runtime: Runtime.NODEJS_16_X,
    });

    if (addPrismaLayer) {
      const prismaLayer = new PrismaLayer(this, `${id}PrismaLayer`);

      this.addLayers(prismaLayer);
    }
  }
}
