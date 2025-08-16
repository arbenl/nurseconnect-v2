# Makefile
# Usage examples:
#   make plan TASK=1-auth-roles AGENT=dev
#   make plan-all TASK=1-auth-roles
#   make apply PLAN=output/1-auth-roles/DEV.plan.json
#   make full-phase TASK=1-auth-roles

.PHONY: plan plan-all
TASK ?= 1-auth-roles
AGENT ?= dev

plan:
	node scripts/agent-runner.mjs $(AGENT) $(TASK)

plan-all:
	node scripts/agent-runner.mjs dev $(TASK)
	node scripts/agent-runner.mjs qa $(TASK)
	node scripts/agent-runner.mjs security $(TASK)
	node scripts/agent-runner.mjs ops $(TASK)

apply:
	@if [ -z "$(PLAN)" ]; then echo "Specify PLAN=output/<task>/<AGENT>.plan.json"; exit 1; fi
	node scripts/apply-plan.mjs $(PLAN)

apply-dry:
	@if [ -z "$(PLAN)" ]; then echo "Specify PLAN=output/<task>/<AGENT>.plan.json"; exit 1; fi
	node scripts/apply-plan.mjs $(PLAN) --dry-run

full-phase:
	# 1) generate plans
	make plan-all TASK=$(TASK)
	# 2) apply DEV plan (code)
	node scripts/apply-plan.mjs output/$(TASK)/DEV.plan.json
	# 3) apply SECURITY plan (rules/config)
	node scripts/apply-plan.mjs output/$(TASK)/SECURITY.plan.json
	# 4) apply OPS plan (CI/config)
	node scripts/apply-plan.mjs output/$(TASK)/OPS.plan.json
	# 5) run QA plan in dry-run to print verification steps
	node scripts/apply-plan.mjs output/$(TASK)/QA.plan.json --dry-run
	@echo "✅ Full phase pipeline prepared. Run QA plan without --dry-run to write tests."
