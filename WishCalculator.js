import plugin from '../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import common from "../../lib/common/common.js";
import { create, all } from 'mathjs'
const config = { }
const math = create(all, config)

export class WishCalculator extends plugin {
    constructor() {
        super({
        name: "祈愿概率计算",
        dsc: "祈愿概率计算",
        /** https://oicqjs.github.io/oicq/#events */
        event: "message.group",
        priority: 200,
        rule: [
            {
                reg: /^\d{1,4}，\d，\d，\d{1,2}，\d，\d，\d{1,2}，\d$/,
                fnc: "calculate",
            },
            {
                reg: /^#*(概率|期望|计算)$/,
                fnc: "help",
            }
        ]
        });
    }

    percent_character(x) {
        if (x<=73) {
            return 0.006
        } else if (x<=89) {
            return (0.006+0.06*(x-73))
        } else {
            return 1
        }
    }

    percent_weapon(x) {
        if (x<=62) {
            return 0.007
        } else if (x<=73) {
            return (0.007+0.07*(x-62))
        } else if (x<=79){
            return (0.777+0.035*(x-73))
        } else {
            return 1
        }
    }

    async calculate(e) {
        let message = e.msg
        let numbers = message.split('，')
        if (parseInt(numbers[0]) > 1200) {
            await e.reply("非法数据，抽数大于1200")
            return
        }
        if (parseInt(numbers[1]) > 7) {
            await e.reply("非法数据，预期抽到角色数大于7")
            return
        }
        if (parseInt(numbers[3]) > 89) {
            await e.reply("非法数据，角色池水位大于89")
            return
        }
        if (parseInt(numbers[4]) > 5) {
            await e.reply("非法数据，预期抽到武器数大于5")
            return
        }
        if (parseInt(numbers[6]) > 79) {
            await e.reply("非法数据，武器池水位大于79")
            return
        }
        if (parseInt(numbers[7]) > 2) {
            await e.reply("非法数据，命定值大于2")
            return
        }
        let nickname = e.sender.card
        await e.reply(`开始为${nickname}计算抽取${numbers[1]-1}命${numbers[4]}精的概率，请稍等`)
        // #拥有的纠缠之缘数量
        let IntertwinedFateNum = parseInt(numbers[0])
        // #期望抽到角色数（0-7）
        let ExpectedCharacterNum = parseInt(numbers[1])
        // #当前是否大保底（True/False）
        let CharacterPoolGuarantee = parseInt(numbers[2])
        if (CharacterPoolGuarantee == 0) {
            CharacterPoolGuarantee = false
        } else {
            CharacterPoolGuarantee = true
        }
        // #角色池的水位（0-89）
        let CharacterPoolStage = parseInt(numbers[3])
        // #期望抽到武器数（0-5）
        let ExpectedWeaponNum = parseInt(numbers[4])
        // #当前是否大保底（True/False）
        let WeaponPoolGuarantee = parseInt(numbers[5])
        if (WeaponPoolGuarantee == 0) {
            WeaponPoolGuarantee = false
        } else {
            WeaponPoolGuarantee = true
        }
        // #武器池的水位（0-79）
        let WeaponPoolStage = parseInt(numbers[6])
        // #命定值（0-2）
        let BindingNum = parseInt(numbers[7])

        let size = 180*ExpectedCharacterNum+400*ExpectedWeaponNum+1
        let TPmatrix = math.zeros((size, size))
        let CharacterPoolOffset = 0

        if (ExpectedCharacterNum != 0) {
            if (CharacterPoolGuarantee == false) {
                CharacterPoolOffset = CharacterPoolStage
            } else {
                CharacterPoolOffset = CharacterPoolStage+90
            }
        }

        for (let i = 0; i < ExpectedWeaponNum; i++) {
            let offset = 400*i
            for (let j = 0; j < 80; j++) {
                let percent = this.percent_weapon(j % 80 + 1)
                if (i == ExpectedWeaponNum-1) {
                    TPmatrix.set([offset+j, offset+400+CharacterPoolOffset],percent*0.375)
                } else {
                    TPmatrix.set([offset+j, offset+400],percent*0.375)
                }
                TPmatrix.set([offset+j, offset+160],percent*0.375)
                TPmatrix.set([offset+j, offset+240],percent*0.25)
                TPmatrix.set([offset+j, offset+j+1],1-percent)
            }
            for (let j = 80; j < 160; j++) {
                let percent = this.percent_weapon(j % 80 + 1)
                if (i == ExpectedWeaponNum-1) {
                    TPmatrix.set([offset+j, offset+400+CharacterPoolOffset],percent*0.5)
                } else {
                    TPmatrix.set([offset+j, offset+400],percent*0.5)
                }
                TPmatrix.set([offset+j, offset+160],percent*0.5)
                if (j != 159) {
                    TPmatrix.set([offset+j, offset+j+1],1-percent)
                }
            }
            for (let j = 160; j < 240; j++) {
                let percent = this.percent_weapon(j % 80 + 1)
                if (i == ExpectedWeaponNum-1) {
                    TPmatrix.set([offset+j, offset+400+CharacterPoolOffset],percent*0.375)
                } else {
                    TPmatrix.set([offset+j, offset+400],percent*0.375)
                }
                TPmatrix.set([offset+j, offset+320],percent*0.625)
                TPmatrix.set([offset+j, offset+j+1],1-percent)
            }
            for (let j = 240; j < 320; j++) {
                let percent = this.percent_weapon(j % 80 + 1)
                if (i == ExpectedWeaponNum-1) {
                    TPmatrix.set([offset+j, offset+400+CharacterPoolOffset],percent*0.5)
                } else {
                    TPmatrix.set([offset+j, offset+400],percent*0.5)
                }
                TPmatrix.set([offset+j, offset+320],percent*0.5)
                if (j != 319) {
                    TPmatrix.set([offset+j, offset+j+1],1-percent)
                }
            }
            for (let j = 320; j < 400; j++) {
                let percent = this.percent_weapon(j % 80 + 1)
                if (i == ExpectedWeaponNum-1) {
                    TPmatrix.set([offset+j, offset+400+CharacterPoolOffset],percent)
                } else {
                    TPmatrix.set([offset+j, offset+400],percent)
                }
                if (j != 399) {
                    TPmatrix.set([offset+j, offset+j+1],1-percent)
                }
            }
        }

        for (let i = 0; i < ExpectedCharacterNum; i++) {
            let offset = 180*i+ExpectedWeaponNum*400
            for (let j = 0; j < 90; j++) {
                let percent = this.percent_character(j % 90 + 1)
                TPmatrix.set([offset+j, offset+180],percent*0.5)
                TPmatrix.set([offset+j, offset+90],percent*0.5)
                if ( j != 89) {
                    TPmatrix.set([offset+j, offset+j+1],1-percent)
                }
            }
            for (let j = 90; j < 180; j++) {
                let percent = this.percent_character(j % 90 + 1)
                TPmatrix.set([offset+j, offset+180],percent)
                if ( j != 179) {
                    TPmatrix.set([offset+j, offset+j+1],1-percent)
                }
            }
        }

        TPmatrix.set([size-1, size-1],1)

        let initVector = math.zeros(size)
        if (ExpectedWeaponNum != 0) {
            if (BindingNum == 0) {
                if (WeaponPoolGuarantee == false) {
                    initVector.set([WeaponPoolStage],1)
                } else {
                    initVector.set([WeaponPoolStage+80],1)
                }
            } else if (BindingNum == 1) {
                if (WeaponPoolGuarantee == false) {
                    initVector.set([WeaponPoolStage+160],1)
                } else {
                    initVector.set([WeaponPoolStage+240],1)
                }
            } else if (BindingNum == 2) {
                initVector.set([WeaponPoolStage+320],1)
            }
        } else {
            initVector.set([CharacterPoolOffset],1)
        }

        let result = initVector
        for (let i = 0; i < IntertwinedFateNum; i++) {
            result = math.multiply(result, TPmatrix)
        }

        let msg=`\n1、拥有粉球数（${IntertwinedFateNum}）\n`+
                `2、期望抽到角色数（${ExpectedCharacterNum}）\n`+
                `3、角色池是否大保底（${CharacterPoolGuarantee}）\n`+
                `4、角色池当前水位（${CharacterPoolStage}）\n`+
                `5、期望抽到武器数（${ExpectedWeaponNum}）\n`+
                `6、武器池是否大保底（${WeaponPoolGuarantee}）\n`+
                `7、武器池当前水位（${WeaponPoolStage}）\n`+
                `8、武器池命定值（${BindingNum}）\n`+
                "在如上条件下，达成抽卡预期的概率为"
        let res_percent = `${math.round(result.get([size-1])*100,2)}%`
        await e.reply([segment.at(e.user_id),msg+res_percent])
        return
    }

    async help(e) {
        let title = "祈愿预期概率计算帮助"
        let body = "按照如下顺序提供数据：\n"+
                    "1、拥有粉球数（1-1200）\n"+
                    "2、期望抽到角色数（0-7）\n"+
                    "3、角色池是否大保底（0/1）\n"+
                    "4、角色池当前水位（0-89）\n"+
                    "5、期望抽到武器数（0-5）\n"+
                    "6、武器池是否大保底（0/1）\n"+
                    "7、武器池当前水位（0-79）\n"+
                    "8、武器池命定值（0-2）\n\n"+
                    "例如我当前拥有400抽，计算从0开始抽2命1精的概率则发送如下消息:\n\n"+
                    "400，3，0，0，1，0，0，0"
        let warning = "注意：本插件使用转移概率矩阵计算祈愿预期概率，抽数和预期UP数越多，所需的计算时间将越长。"
        let msg = await common.makeForwardMsg(e, [title, body, warning],title)
        await e.reply(msg)
        return
    }

}